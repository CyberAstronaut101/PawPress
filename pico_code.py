import network
import ubinascii
import socket
from time import sleep
from picozero import pico_temp_sensor, pico_led
import machine
import json
import urequests

ssid = 'McMason_IoT'
password = 'elliotRulesIot!'

CONTROLLER_IP = "10.21.180.238"
CONTROLLER_PORT = "8080"
NUMBUTTONS = 69

def connect():
    #Connect to WLAN
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    while wlan.isconnected() == False:
        print('Waiting for connection...')
        sleep(1)
    print(wlan.ifconfig())
    ip = wlan.ifconfig()[0]
    print(f'Connected on {ip}')
    return ip
    
def identify_node_to_controller():
    # Build the payload
    data = {
        "ip_address": ip,
        "number_buttons": NUMBUTTONS,
        "mac_address": ubinascii.hexlify(network.WLAN().config('mac'),':').decode()
    }
    
    # Build the url
    identify_endpoint = "http://" + CONTROLLER_IP + ":" + CONTROLLER_PORT + "/api/v1/controlnodes/identify"
    
    # Send Identify Post Request
    r = urequests.post(identify_endpoint, json=data)
    print(r.text)
    r.close()
    
def send_button_press(buttonIndex):
    
    # Build the URL
    buttonpress_endpoint = "http://" + CONTROLLER_IP + ":" + CONTROLLER_PORT + "/api/v1/controlnodes/identify"

try:
    ip = connect()
    #connection = open_socket(ip)
    
    # Once Connected, send identify payload
    identify_node_to_controller()
    
    #UID = build_identify_data(ip)
    
    #r = urequests.post(orchestration_server_ip, json=UID)
    #r.close()
    
    
    
    
except KeyboardInterrupt:
    machine.reset()

