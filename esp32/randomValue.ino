#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include <Arduino.h>


void AE_HX711_Init(void);
void AE_HX711_Reset(void);
long AE_HX711_Read(void);
long AE_HX711_Averaging(long adc,char num);
float AE_HX711_getGram(char num);

BLECharacteristic *pCharacteristic;
bool deviceConnected = false;
int txValue = 0;

#define pin_dout  32
#define pin_slk   33
#define OUT_VOL   0.002f      //定格出力 [V]
#define LOAD      20000.0f    //定格容量 [g]
#define SERVICE_UUID        "21a03e20-cd8a-4a1b-9cb0-f5320ebe873a"
#define CHARACTERISTIC_UUID "476665e7-7dfb-4ab0-8b82-ec59e6a1f37a"

float offset;

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  };

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
  }
};

void setup() {
 Serial.begin(9600);

 BLEDevice::init("ESP32");

 BLEServer *pServer = BLEDevice::createServer();
 pServer->setCallbacks(new MyServerCallbacks());

 BLEService *pService = pServer->createService(SERVICE_UUID);

 pCharacteristic = pService->createCharacteristic(
                    CHARACTERISTIC_UUID,
                    BLECharacteristic::PROPERTY_NOTIFY
                   );

 pCharacteristic->addDescriptor(new BLE2902());

 pService->start();

 pServer->getAdvertising()->start();
 Serial.println("Wating for a client connection ton notyfy...");

  AE_HX711_Init();
  AE_HX711_Reset();
  offset = AE_HX711_getGram(30); 
}

void loop() {
  if (deviceConnected) {
    float data;
    char S1[20];
    char s[20];
    data = AE_HX711_getGram(5);
    sprintf(S1,"%s [g] (0x%4x)",dtostrf((data-offset), 5, 3, s),AE_HX711_Read());
    Serial.println(S1);
    delay(500);

    txValue = data;
//    txValue = random(-10, 20);

    char txString[8];
    dtostrf(txValue, 1, 2, txString);

    pCharacteristic->setValue(txString);

    pCharacteristic->notify();
    
    Serial.println("sent value: " + String(txString));

   
  }

}
void AE_HX711_Init(void)
{
  pinMode(pin_slk, OUTPUT);
  pinMode(pin_dout, INPUT);
}

void AE_HX711_Reset(void)
{
  digitalWrite(pin_slk,1);
  delayMicroseconds(100);
  digitalWrite(pin_slk,0);
  delayMicroseconds(100); 
}

long AE_HX711_Read(void)
{
  long data=0;
  while(digitalRead(pin_dout)!=0);
  delayMicroseconds(10);
  for(int i=0;i<24;i++)
  {
    digitalWrite(pin_slk,1);
    delayMicroseconds(5);
    digitalWrite(pin_slk,0);
    delayMicroseconds(5);
    data = (data<<1)|(digitalRead(pin_dout));
  }
  //Serial.println(data,HEX);   
  digitalWrite(pin_slk,1);
  delayMicroseconds(10);
  digitalWrite(pin_slk,0);
  delayMicroseconds(10);
  return data^0x800000; 
}


long AE_HX711_Averaging(long adc,char num)
{
  long sum = 0;
  for (int i = 0; i < num; i++) sum += AE_HX711_Read();
  return sum / num;
}

float AE_HX711_getGram(char num)
{
  #define HX711_R1  20000.0f
  #define HX711_R2  8200.0f
  #define HX711_VBG 1.25f
  #define HX711_AVDD      4.2987f//(HX711_VBG*((HX711_R1+HX711_R2)/HX711_R2))
  #define HX711_ADC1bit   HX711_AVDD/16777216 //16777216=(2^24)
  #define HX711_PGA 128
  #define HX711_SCALE     (OUT_VOL * HX711_AVDD / LOAD *HX711_PGA)
  
  float data;

  data = AE_HX711_Averaging(AE_HX711_Read(),num)*HX711_ADC1bit; 
  //Serial.println( HX711_AVDD);   
  //Serial.println( HX711_ADC1bit);   
  //Serial.println( HX711_SCALE);   
  //Serial.println( data);   
  data =  data / HX711_SCALE;


  return data;
}
