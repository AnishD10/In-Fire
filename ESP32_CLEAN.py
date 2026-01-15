import network
import time
import machine
from machine import Pin, PWM, ADC
from umqtt.simple import MQTTClient
import json

GPIO_RELAY = 33
GPIO_SERVO = 14
GPIO_SENSOR = 34
GPIO_BUZZER = 27
GPIO_LED_GREEN = 25
GPIO_LED_RED = 26

THRESHOLD = 1200
HOLD_TIME = 10

MQTT_BROKER = 'd9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud'
MQTT_PORT = 8883
MQTT_USER = 'LPG_Detection'
MQTT_PASSWORD = 'Fire@101'
MQTT_CLIENT_ID = 'esp32-gas-detector-' + str(machine.unique_id())

MQTT_TOPIC_GAS = 'LPG/gas/value'
MQTT_TOPIC_STATUS = 'LPG/gas/status'
MQTT_TOPIC_CONTROL = 'LPG/system/control'
MQTT_TOPIC_LOG = 'LPG/system/log'

WIFI_NETWORKS = [
    ('oh-ho!', 'Dangals.LM10'),
    ('IIC_WIFI', '!tah@rIntl2025')
]

wifi_connected = False
mqtt_connected = False
mqtt_client = None
system_on = True
alert_active = False
alert_timer = 0
last_gas_value = 0

print("Initializing hardware...")

relay = Pin(GPIO_RELAY, Pin.OUT)
relay.off()
print("  ✓ Relay (GPIO 33) initialized")

servo = PWM(Pin(GPIO_SERVO), freq=50)
servo.duty(38)
print("  ✓ Servo (GPIO 14) PWM initialized")

adc = ADC(Pin(GPIO_SENSOR))
adc.atten(ADC.ATTN_11DB)
adc.width(ADC.WIDTH_12BIT)
print("  ✓ Gas Sensor (GPIO 34) ADC initialized")

buzzer = Pin(GPIO_BUZZER, Pin.OUT)
buzzer.off()
print("  ✓ Buzzer (GPIO 27) initialized")

led_green = Pin(GPIO_LED_GREEN, Pin.OUT)
led_red = Pin(GPIO_LED_RED, Pin.OUT)
led_green.off()
led_red.off()
print("  ✓ LEDs (GPIO 25, 26) initialized")

print("\n✓ All hardware initialized!\n")

def connect_wifi():
    global wifi_connected
    
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    
    for ssid, password in WIFI_NETWORKS:
        print(f"Attempting: {ssid}...")
        wlan.connect(ssid, password)
        
        timeout = 15
        while not wlan.isconnected() and timeout > 0:
            print(f"  Waiting... ({timeout}s)")
            time.sleep(1)
            timeout -= 1
        
        if wlan.isconnected():
            print(f"✓ Connected to {ssid}! IP: {wlan.ifconfig()[0]}")
            wifi_connected = True
            return True
    
    print("✗ WiFi Connection Failed - All networks tried!")
    wifi_connected = False
    return False

def on_mqtt_message(topic, msg):
    global system_on, alert_active
    
    message = msg.decode('utf-8')
    topic_str = topic.decode('utf-8') if isinstance(topic, bytes) else topic
    
    print(f"[MQTT] {topic_str}: {message}")
    
    if topic_str == MQTT_TOPIC_CONTROL:
        handle_command(message)

def handle_command(command):
    global system_on, alert_active
    
    print(f">>> Executing command: {command}")
    
    if command == 'ON':
        normal_mode()
        send_log(f"System turned ON")
        
    elif command == 'OFF':
        all_off()
        send_log(f"System turned OFF")
        
    elif command == 'TEST':
        test_alert()
        send_log(f"Test alert triggered")
    
    elif command == 'RELAY_ON':
        relay.on()
        send_log(f"Relay ON (Gas valve OPEN)")
        print("  💨 Relay ON - Gas flowing")
        
    elif command == 'RELAY_OFF':
        relay.off()
        send_log(f"Relay OFF (Gas valve CLOSED)")
        print("  🔒 Relay OFF - Gas blocked")
    
    elif command == 'SERVO_0':
        set_servo(0)
        send_log(f"Servo moved to 0° (closed)")
        print("  📍 Servo: 0° (Closed)")
        
    elif command == 'SERVO_90':
        set_servo(90)
        send_log(f"Servo moved to 90° (open)")
        print("  📍 Servo: 90° (Open)")
        
    elif command == 'SERVO_180':
        set_servo(180)
        send_log(f"Servo moved to 180° (max)")
        print("  📍 Servo: 180° (Max ventilation)")
    
    elif command == 'LED_GREEN':
        led_green.on()
        led_red.off()
        send_log(f"Green LED ON")
        print("  🟢 Green LED ON")
        
    elif command == 'LED_RED':
        led_green.off()
        led_red.on()
        send_log(f"Red LED ON")
        print("  🔴 Red LED ON")
        
    elif command == 'LED_OFF':
        led_green.off()
        led_red.off()
        send_log(f"All LEDs OFF")
        print("  ⚫ All LEDs OFF")
    
    elif command == 'BUZZER_ON':
        buzzer.on()
        send_log(f"Buzzer ON")
        print("  🔔 Buzzer ON")
        
    elif command == 'BUZZER_OFF':
        buzzer.off()
        send_log(f"Buzzer OFF")
        print("  🔇 Buzzer OFF")
    
    elif command == 'ALERT_MODE':
        alert_mode()
        send_log(f"ALERT MODE activated")
        
    elif command == 'NORMAL_MODE':
        normal_mode()
        send_log(f"NORMAL MODE activated")
        
    elif command == 'SERVO_WITH_FAN':
        servo.duty(77)
        relay.off()
        led_red.on()
        led_green.off()
        buzzer.on()
        send_log(f"EMERGENCY: Servo 90° + Fan OFF + Alert")
        print("  🚨 EMERGENCY: Servo open + Gas blocked + Alert!")
        time.sleep(2)
        buzzer.off()

def set_servo(angle):
    if angle == 0:
        servo.duty(38)
    elif angle == 90:
        servo.duty(77)
    elif angle == 180:
        servo.duty(115)
    else:
        duty = int(38 + (angle / 180) * (115 - 38))
        servo.duty(duty)

def alert_mode():
    global alert_active
    alert_active = True
    led_green.off()
    led_red.on()
    relay.off()
    servo.duty(77)
    buzzer.on()
    print("  ⚠️ ALERT MODE: Red LED + Relay OFF + Servo 90° + Buzzer ON")

def normal_mode():
    global alert_active
    alert_active = False
    led_green.on()
    led_red.off()
    relay.on()
    servo.duty(38)
    buzzer.off()
    print("  ✅ NORMAL MODE: Green LED + Relay ON + Servo 0° + Buzzer OFF")

def test_alert():
    print("  🧪 TEST ALERT SEQUENCE")
    for i in range(3):
        buzzer.on()
        time.sleep(0.2)
        buzzer.off()
        time.sleep(0.2)
    
    led_red.on()
    led_green.off()
    time.sleep(1)
    
    servo.duty(77)
    time.sleep(1)
    
    relay.off()
    time.sleep(1)
    
    normal_mode()

def all_off():
    relay.off()
    servo.duty(38)
    buzzer.off()
    led_green.off()
    led_red.off()
    print("  ⚫ All systems OFF")

def send_log(message):
    if mqtt_connected:
        try:
            mqtt_client.publish(MQTT_TOPIC_LOG, message)
        except:
            pass

def connect_mqtt():
    global mqtt_client, mqtt_connected
    
    print(f"Connecting to MQTT: {MQTT_BROKER}:{MQTT_PORT}...")
     
    try:
        mqtt_client = MQTTClient(
            MQTT_CLIENT_ID,
            MQTT_BROKER,
            port=MQTT_PORT,
            user=MQTT_USER,
            password=MQTT_PASSWORD,
            ssl=True,
            ssl_params={"server_hostname": MQTT_BROKER},
            keepalive=60
        )
        
        mqtt_client.set_callback(on_mqtt_message)
        mqtt_client.connect()
        mqtt_client.subscribe(MQTT_TOPIC_CONTROL)
        
        print("✓ MQTT Connected!")
        mqtt_connected = True
        
        mqtt_client.publish(MQTT_TOPIC_STATUS, "SYSTEM_READY")
        mqtt_client.publish(MQTT_TOPIC_LOG, "System started")
        
        return True
    except Exception as e:
        print(f"✗ MQTT Connection failed: {e}")
        mqtt_connected = False
        return False

def read_gas_sensor():
    try:
        raw = adc.read()
        return raw
    except:
        return 0

print("\n=== IoT Gas Leakage Detection System ===\n")

if connect_wifi():
    if connect_mqtt():
        print("\n✓ System Ready! Starting monitoring...\n")
        
        normal_mode()
        
        read_count = 0
        
        while True:
            try:
                if mqtt_connected:
                    try:
                        mqtt_client.check_msg()
                    except OSError as e:
                        print(f"✗ MQTT disconnected, attempting to reconnect...")
                        mqtt_connected = False
                        if connect_mqtt():
                            print("✓ MQTT Reconnected!")
                        continue
                
                if read_count >= 20:
                    gas_value = read_gas_sensor()
                    last_gas_value = gas_value
                    
                    if system_on:
                        if gas_value > THRESHOLD:
                            if not alert_active:
                                print(f"\n⚠️  GAS ALERT! Value: {gas_value} (> {THRESHOLD})")
                                alert_mode()
                                
                                if mqtt_connected:
                                    mqtt_client.publish(MQTT_TOPIC_GAS, str(gas_value))
                                    mqtt_client.publish(MQTT_TOPIC_STATUS, 
                                        f"GAS_DETECTED - Value: {gas_value} - EMERGENCY")
                                    send_log(f"GAS ALERT: Value {gas_value}")
                                
                                alert_timer = HOLD_TIME
                        else:
                            if alert_active and alert_timer <= 0:
                                print(f"\n✓ Gas level returning to normal ({gas_value})")
                                normal_mode()
                                if mqtt_connected:
                                    mqtt_client.publish(MQTT_TOPIC_STATUS, "NORMAL")
                                    send_log(f"System recovered. Gas: {gas_value}")
                            
                            if mqtt_connected:
                                mqtt_client.publish(MQTT_TOPIC_GAS, str(gas_value))
                            print(f"Gas: {gas_value} ADC (Normal)")
                        
                        if alert_timer > 0:
                            alert_timer -= 1
                    
                    read_count = 0
                
                read_count += 1
                time.sleep(0.1)
                
            except KeyboardInterrupt:
                print("\nShutdown...")
                all_off()
                break
            except Exception as e:
                print(f"Error in main loop: {e}")
                time.sleep(1)
    else:
        print("Failed to connect to MQTT. Check credentials.")
else:
    print("Failed to connect to WiFi. Check credentials.")

print("\nSystem halted.")
