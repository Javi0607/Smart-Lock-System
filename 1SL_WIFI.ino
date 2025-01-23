
#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>

WebServer server(80);
Servo myServo;

const int servoPin = 33;
const char* ssid     = "-";
const char* password = "-";

void handleRoot() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "ESP32 está listo para recibir datos.");
}

void handleControl() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  if (server.hasArg("value")) {
    String value = server.arg("value");
    if (value == "1") {
      myServo.write(110);
      server.send(200, "text/plain", "Pin 12 activado (HIGH).");
    } else if (value == "0") {
      myServo.write(70);
      server.send(200, "text/plain", "Pin 12 desactivado (LOW).");
    } else {
      server.send(400, "text/plain", "Valor no válido. Usa 1 o 0.");
    }
  } else {
    server.send(400, "text/plain", "Falta el parámetro 'value'.");
  }
}

void setup() {
  Serial.begin(921600);
  Serial.println("Desconectamos antes de conectar el WiFi");
  WiFi.disconnect();
  Serial.print("Conectando a  ");
  Serial.println(ssid);
  //Conectamos el esp a la red wifi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  //Intentamos conectarnos a la red
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  //Si logramos conectarnos mostramos la ip a la que nos conectamos
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Configurar rutas del servidor
  server.on("/", handleRoot);
  server.on("/data", handleControl);

  server.begin();
  Serial.println("Servidor iniciado.");

  //Configuracion salida del actuador lineal
  myServo.attach(servoPin);
  myServo.write(70);
  delay(500);
}

void loop() {
  // put your main code here, to run repeatedly:

  server.handleClient();


}
