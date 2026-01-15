"""
IoT Gas Leakage Detection System - ESP32 MicroPython Code
Compatible with HiveMQ Cloud MQTT Broker
Author: Academic Project
"""

from machine import Pin, ADC, PWM
import network
import time
from umqtt.simple import MQTTClient

# ==================================================
# WiFi Configuration (Multiple Networks)
# ==================================================
WIFI_NETWORKS = [
    {"ssid": "IIC_WIFI", "password": "!tah@rIntl2025"},
    {"ssid": "oh-ho!", "password": "Dangals.LM10"}
]

# ==================================================
# HiveMQ Cloud Configuration (SSL/TLS)
# ==================================================
MQTT_HOST = "d9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USER = "LPG_Detection"
MQTT_PASS = "Fire@101"
MQTT_CLIENT_ID = "d9224a87ae11416ebdfea8fc7ef45621"
MQTT_TOPIC_GAS = b"LPG/gas/value"
MQTT_TOPIC_STATUS = b"LPG/gas/status"
MQTT_TOPIC_CONTROL = b"LPG/system/control"

# ==================================================
# MQ-2 Gas Sensor
# ==================================================
gas = ADC(Pin(34))
gas.atten(ADC.ATTN_11DB)
THRESHOLD = 1200

# ==================================================
# Actuators (GPIO Configuration)
# ==================================================
green = Pin(25, Pin.OUT)      # Green LED (normal state)
red = Pin(26, Pin.OUT)         # Red LED (alert state)
buzzer = Pin(27, Pin.OUT)      # Buzzer (alarm)
relay = Pin(33, Pin.OUT)       # Relay (gas valve control)
servo = PWM(Pin(14), freq=50)  # Servo motor (vent control)

# ==================================================
# Servo Control Function
# ==================================================
def set_angle(angle):
    """
    Control servo angle (0-180 degrees)
    0° = Vent closed
    90° = Vent open
    180° = Fully open
    """
    duty = int((angle / 180) * 75 + 40)
    servo.duty(duty)

# ==================================================
# WiFi Connection (Try Multiple Networks)
# ==================================================
def connect_wifi():
    """
    Connect to WiFi with fallback to multiple networks
    Returns: True if connected, False otherwise
    """
    wifi = network.WLAN(network.STA_IF)
    wifi.active(True)
    
    for net in WIFI_NETWORKS:
        print(f"Trying: {net['ssid']}...")
        wifi.connect(net['ssid'], net['password'])
        
        # Wait up to 10 seconds
        for attempt in range(20):
            if wifi.isconnected():
                print(f"✓ Connected to {net['ssid']}!")
                print(f"IP: {wifi.ifconfig()[0]}")
                return True
            time.sleep(0.5)
        
        # Failed, try next network
        wifi.disconnect()
    
    print("✗ Failed to connect to any WiFi network")
    return False

# ==================================================
# Individual Component Control Functions
# ==================================================
def relay_on():
    """Turn relay ON (gas valve opens)"""
    relay.on()
    print("  💨 Relay ON - Gas flowing")

def relay_off():
    """Turn relay OFF (gas valve closes)"""
    relay.off()
    print("  🔒 Relay OFF - Gas blocked")

def servo_0():
    """Set servo to 0° (vent closed)"""
    set_angle(0)
    print("  📍 Servo: 0° (Closed)")

def servo_90():
    """Set servo to 90° (vent open)"""
    set_angle(90)
    print("  📍 Servo: 90° (Open)")

def servo_180():
    """Set servo to 180° (fully open)"""
    set_angle(180)
    print("  📍 Servo: 180° (Max ventilation)")

def led_green():
    """Turn green LED ON"""
    green.on()
    red.off()
    print("  🟢 Green LED ON")

def led_red():
    """Turn red LED ON"""
    red.on()
    green.off()
    print("  🔴 Red LED ON")

def led_off():
    """Turn all LEDs OFF"""
    green.off()
    red.off()
    print("  ⚫ All LEDs OFF")

def buzzer_on():
    """Turn buzzer ON"""
    buzzer.on()
    print("  🔔 Buzzer ON")

def buzzer_off():
    """Turn buzzer OFF"""
    buzzer.off()
    print("  🔇 Buzzer OFF")

def normal_mode():
    """Return to normal operation mode"""
    green.on()
    red.off()
    relay.on()
    buzzer.off()
    set_angle(0)
    print("  ✅ NORMAL MODE: Green LED + Relay ON + Servo 0°")

def alert_mode():
    """Activate alert mode"""
    red.on()
    green.off()
    relay.off()
    buzzer.on()
    set_angle(90)
    print("  ⚠️ ALERT MODE: Red LED + Relay OFF + Servo 90° + Buzzer ON")

def servo_with_fan():
    """Emergency: open vent and close gas valve"""
    servo_90()
    relay_off()
    led_red()
    buzzer_on()
    print("  🚨 EMERGENCY: Servo 90° + Gas OFF + Alert")
    time.sleep(2)
    buzzer_off()

# ==================================================
# MQTT Callback Handler (Enhanced with 15+ Commands)
# ==================================================
def mqtt_callback(topic, msg):
    """
    Handle incoming MQTT messages
    Supports 15+ control commands
    """
    command = msg.decode()
    print(f"[MQTT] Received: {topic.decode()} = {command}")
    
    if topic == MQTT_TOPIC_CONTROL:
        # System Control
        if command == "ON":
            print("🟢 System turned ON")
            normal_mode()
            
        elif command == "OFF":
            print("🔴 System turned OFF")
            relay.off()
            green.off()
            red.off()
            buzzer.off()
            set_angle(180)
            
        elif command == "TEST":
            print("🧪 Running system test...")
            normal_mode()
            time.sleep(1)
            alert_mode()
            time.sleep(2)
            normal_mode()
            print("✓ Test complete")
        
        # Relay Commands
        elif command == "RELAY_ON":
            relay_on()
        elif command == "RELAY_OFF":
            relay_off()
        
        # Servo Commands
        elif command == "SERVO_0":
            servo_0()
        elif command == "SERVO_90":
            servo_90()
        elif command == "SERVO_180":
            servo_180()
        
        # LED Commands
        elif command == "LED_GREEN":
            led_green()
        elif command == "LED_RED":
            led_red()
        elif command == "LED_OFF":
            led_off()
        
        # Buzzer Commands
        elif command == "BUZZER_ON":
            buzzer_on()
        elif command == "BUZZER_OFF":
            buzzer_off()
        
        # Integrated Scenarios
        elif command == "NORMAL_MODE":
            normal_mode()
        elif command == "ALERT_MODE":
            alert_mode()
        elif command == "SERVO_WITH_FAN":
            servo_with_fan()
        
        else:
            print(f"  ⚠️ Unknown command: {command}")

# ==================================================
# MQTT Connection with SSL/TLS
# ==================================================
def connect_mqtt():
    """
    Connect to HiveMQ Cloud MQTT broker
    Uses TLS/SSL on port 8883
    """
    ssl_params = {"server_hostname": MQTT_HOST}
    
    client = MQTTClient(
        client_id=MQTT_CLIENT_ID,
        server=MQTT_HOST,
        port=MQTT_PORT,
        user=MQTT_USER,
        password=MQTT_PASS,
        ssl=True,
        ssl_params=ssl_params
    )
    
    client.set_callback(mqtt_callback)
    
    print("Connecting to HiveMQ Cloud...")
    try:
        client.connect()
        print("✓ Connected to HiveMQ Cloud via TLS!")
        
        # Subscribe to control topic
        client.subscribe(MQTT_TOPIC_CONTROL)
        print("✓ Subscribed to control topic")
        
        return client
    except Exception as e:
        print(f"✗ MQTT Connection Failed: {e}")
        return None

# ==================================================
# System Initialization
# ==================================================
print("\n" + "="*50)
print("IoT Gas Leakage Detection System")
print("="*50)

# Connect WiFi
if not connect_wifi():
    raise Exception("WiFi connection failed")

# Connect MQTT
mqtt_client = connect_mqtt()
if not mqtt_client:
    raise Exception("MQTT connection failed")

# Initial state
set_angle(0)  # Vent closed
relay.on()    # System ON
green.on()    # Green LED
red.off()     # Red LED off
buzzer.off()  # Buzzer off

print("✓ System initialized and ready")
print("="*50 + "\n")

# ==================================================
# Main Loop - Continuous Monitoring
# ==================================================
while True:
    try:
        # Process MQTT messages
        mqtt_client.check_msg()
        
        # Read gas sensor
        value = gas.read()
        print(f"Gas Value: {value}")
        
        # Publish gas reading
        mqtt_client.publish(MQTT_TOPIC_GAS, bytes(str(value), "utf-8"))
        
        # Check if gas leakage (Threshold: 1200)
        if value > THRESHOLD:
            print("⚠️ GAS LEAKAGE DETECTED! Value: {} (Threshold: {})".format(value, THRESHOLD))
            
            # Alert mode
            red.on()
            green.off()
            buzzer.on()
            relay.off()           # Cut gas supply
            set_angle(90)         # Open vent
            
            # Publish alert status with value
            alert_msg = "GAS_DETECTED - Value: {} - EMERGENCY".format(value)
            mqtt_client.publish(MQTT_TOPIC_STATUS, bytes(alert_msg, 'utf-8'))
            
            # Stay in alert for 10 seconds
            time.sleep(10)
            
        else:
            # Normal mode
            print("✅ Gas Level Normal")
            
            red.off()
            green.on()
            buzzer.off()
            relay.on()
            set_angle(0)
            
            # Publish status
            mqtt_client.publish(MQTT_TOPIC_STATUS, b"NORMAL")
        
        # Wait before next reading
        time.sleep(2)
        
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(2)
