"""
IoT Gas Leakage Detection System - ESP32 MicroPython Code
Compatible with HiveMQ Cloud MQTT Broker
Threshold: 1200 | Control: ON/OFF/TEST
Author: Academic Project
Updated: January 2026

INSTRUCTIONS:
1. Copy this entire code
2. Open Thonny IDE
3. Connect ESP32 via USB
4. Create new file and paste this code
5. File → Save As → main.py
6. Select device: Raspberry Pi Pico
7. Click Save (uploads to ESP32)
8. ESP32 will auto-run on startup
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
# MQTT Callback Handler
# ==================================================
def mqtt_callback(topic, msg):
    """
    Handle incoming MQTT messages
    Expects control commands: ON, OFF, TEST
    """
    command = msg.decode()
    print(f"[MQTT] Received: {topic.decode()} = {command}")
    
    if topic == MQTT_TOPIC_CONTROL:
        if command == "ON":
            print("🟢 System turned ON")
            relay.on()
            green.on()
            red.off()
            buzzer.off()
            set_angle(0)
            
        elif command == "OFF":
            print("🔴 System turned OFF")
            relay.off()
            green.off()
            red.on()
            buzzer.off()
            set_angle(180)
            
        elif command == "TEST":
            print("🧪 Running system test...")
            # Test all components
            relay.on()
            red.on()
            buzzer.on()
            set_angle(90)
            time.sleep(2)
            
            # Return to safe state
            relay.on()
            red.off()
            green.on()
            buzzer.off()
            set_angle(0)
            print("✓ Test complete")

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
print("Threshold: 1200 | Updated: Jan 2026")
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
            
            # Backend will automatically send emails to all subscribers!
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
