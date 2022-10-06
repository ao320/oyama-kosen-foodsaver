//registration
let key = "AIzaSyDK02C1juOOwY4C3IOwErohZSuiw5BDaDw";
let url = "https://vision.googleapis.com/v1/images:annotate?key=";
let api_url = url + key;
const video = document.getElementById("camera");
const canvas = document.getElementById("picture");
let apiResult = document.getElementById("result");
let shuttuer = document.getElementById("shutter");
let button = document.getElementById("button");
let retake = document.getElementById("retake");
let api = document.getElementById("api");
let form = document.getElementById("form");
let fixResult;
let base64;
let request;
let matchData;
let message;
let foodsName = ["初心者", "バックエンド","スマホ","プリント","無変換","デジタル","なす","ナス","マスカット","ぶどう","ブドウ","からあげ","唐揚げ"];

var BlueJelly = function () {
    this.bluetoothDevice = null;
    this.dataCharacteristic = null;
    this.hashUUID = {};
    this.hashUUID_lastConnected;

    //callBack
    this.onScan = function (deviceName) {
        console.log("onScan");
    };
    this.onConnectGATT = function (uuid) {
        console.log("onConnectGATT");
    };
    this.onRead = function (data, uuid) {
        console.log("onRead");
    };
    this.onWrite = function (uuid) {
        console.log("onWrite");
    };
    this.onStartNotify = function (uuid) {
        console.log("onStartNotify");
    };
    this.onStopNotify = function (uuid) {
        console.log("onStopNotify");
    };
    this.onDisconnect = function () {
        console.log("onDisconnect");
    };
    this.onClear = function () {
        console.log("onClear");
    };
    this.onReset = function () {
        console.log("onReset");
    };
    this.onError = function (error) {
        console.log("onError");
    };
};

//--------------------------------------------------
//setUUID
//--------------------------------------------------
BlueJelly.prototype.setUUID = function (name, serviceUUID, characteristicUUID) {
    console.log("Execute : setUUID");
    console.log(this.hashUUID);

    this.hashUUID[name] = {
        serviceUUID: serviceUUID,
        characteristicUUID: characteristicUUID,
    };
};

//--------------------------------------------------
//scan
//--------------------------------------------------
BlueJelly.prototype.scan = function (uuid) {
    return (
        this.bluetoothDevice ? Promise.resolve() : this.requestDevice(uuid)
    ).catch((error) => {
        console.log("Error : " + error);
        this.onError(error);
    });
};

//--------------------------------------------------
//requestDevice
//--------------------------------------------------
BlueJelly.prototype.requestDevice = function (uuid) {
    console.log("Execute : requestDevice");
    return navigator.bluetooth
        .requestDevice({
            filters: [{ name: "ESP32" }],
            optionalServices: [this.hashUUID[uuid].serviceUUID],
        })
        .then((device) => {
            this.bluetoothDevice = device;
            this.bluetoothDevice.addEventListener(
                "gattserverdisconnected",
                this.onDisconnect
            );
            this.onScan(this.bluetoothDevice.name);
        });
};

//--------------------------------------------------
//connectGATT
//--------------------------------------------------
BlueJelly.prototype.connectGATT = function (uuid) {
    if (!this.bluetoothDevice) {
        var error = "No Bluetooth Device";
        console.log("Error : " + error);
        this.onError(error);
        return;
    }
    if (this.bluetoothDevice.gatt.connected && this.dataCharacteristic) {
        if (this.hashUUID_lastConnected == uuid) return Promise.resolve();
    }
    this.hashUUID_lastConnected = uuid;

    console.log("Execute : connect");
    return this.bluetoothDevice.gatt
        .connect()
        .then((server) => {
            console.log("Execute : getPrimaryService");
            return server.getPrimaryService(this.hashUUID[uuid].serviceUUID);
        })
        .then((service) => {
            console.log("Execute : getCharacteristic");
            return service.getCharacteristic(
                this.hashUUID[uuid].characteristicUUID
            );
        })
        .then((characteristic) => {
            this.dataCharacteristic = characteristic;
            this.dataCharacteristic.addEventListener(
                "characteristicvaluechanged",
                this.dataChanged(this, uuid)
            );
            this.onConnectGATT(uuid);
        })
        .catch((error) => {
            console.log("Error : " + error);
            this.onError(error);
        });
};

//--------------------------------------------------
//dataChanged
//--------------------------------------------------
BlueJelly.prototype.dataChanged = function (self, uuid) {
    return function (event) {
        self.onRead(event.target.value, uuid);
    };
};

//--------------------------------------------------
//read
//--------------------------------------------------
BlueJelly.prototype.read = function (uuid) {
    return this.scan(uuid)
        .then(() => {
            return this.connectGATT(uuid);
        })
        .then(() => {
            console.log("Execute : readValue");
            return this.dataCharacteristic.readValue();
        })
        .catch((error) => {
            console.log("Error : " + error);
            this.onError(error);
        });
};

//--------------------------------------------------
//write
//--------------------------------------------------
BlueJelly.prototype.write = function (uuid, array_value) {
    return this.scan(uuid)
        .then(() => {
            return this.connectGATT(uuid);
        })
        .then(() => {
            console.log("Execute : writeValue");
            data = Uint32Array.from(array_value);
            return this.dataCharacteristic.writeValue(data);
        })
        .then(() => {
            this.onWrite(uuid);
        })
        .catch((error) => {
            console.log("Error : " + error);
            this.onError(error);
        });
};

//--------------------------------------------------
//startNotify
//--------------------------------------------------
BlueJelly.prototype.startNotify = function (uuid) {
    return this.scan(uuid)
        .then(() => {
            return this.connectGATT(uuid);
        })
        .then(() => {
            console.log("Execute : startNotifications");
            this.dataCharacteristic.startNotifications();
        })
        .then(() => {
            this.onStartNotify(uuid);
        })
        .catch((error) => {
            console.log("Error : " + error);
            this.onError(error);
        });
};

//--------------------------------------------------
//stopNotify
//--------------------------------------------------
BlueJelly.prototype.stopNotify = function (uuid) {
    return this.scan(uuid)
        .then(() => {
            return this.connectGATT(uuid);
        })
        .then(() => {
            console.log("Execute : stopNotifications");
            this.dataCharacteristic.stopNotifications();
        })
        .then(() => {
            this.onStopNotify(uuid);
        })
        .catch((error) => {
            console.log("Error : " + error);
            this.onError(error);
        });
};

//--------------------------------------------------
//disconnect
//--------------------------------------------------
BlueJelly.prototype.disconnect = function () {
    if (!this.bluetoothDevice) {
        var error = "No Bluetooth Device";
        console.log("Error : " + error);
        this.onError(error);
        return;
    }

    if (this.bluetoothDevice.gatt.connected) {
        console.log("Execute : disconnect");
        this.bluetoothDevice.gatt.disconnect();
    } else {
        var error = "Bluetooth Device is already disconnected";
        console.log("Error : " + error);
        this.onError(error);
        return;
    }
};

//--------------------------------------------------
//clear
//--------------------------------------------------
BlueJelly.prototype.clear = function () {
    console.log("Excute : Clear Device and Characteristic");
    this.bluetoothDevice = null;
    this.dataCharacteristic = null;
    this.onClear();
};

//--------------------------------------------------
//reset(disconnect & clear)
//--------------------------------------------------
BlueJelly.prototype.reset = function () {
    console.log("Excute : reset");
    this.disconnect(); //disconnect() is not Promise Object
    this.clear();
    this.onReset();
};


const ble = new BlueJelly();

window.onload = function () {
    console.log("hello")
    //UUIDの設定
    ble.setUUID(
        "UUID1",
        "21a03e20-cd8a-4a1b-9cb0-f5320ebe873a",
        "476665e7-7dfb-4ab0-8b82-ec59e6a1f37a"
    );
};

//--------------------------------------------------
//Scan後の処理
//--------------------------------------------------
ble.onScan = function (deviceName) {
    document.getElementById("device_name").innerHTML = deviceName;
    document.getElementById("status").innerHTML = "found device!";
};

//--------------------------------------------------
//ConnectGATT後の処理
//--------------------------------------------------
ble.onConnectGATT = function (uuid) {
    console.log("> connected GATT!");

    document.getElementById("uuid_name").innerHTML = uuid;
    document.getElementById("status").innerHTML = "connected GATT!";
};

//--------------------------------------------------
//Read後の処理：得られたデータの表示など行う
//--------------------------------------------------
ble.onRead = function (data, uuid){
    //フォーマットに従って値を取得
    var value = data.buffer;
    message = new TextDecoder("utf-8").decode(value);
    message = (parseInt((parseFloat(message) - 39425) * 2.116));
    if (message < 0){
        message = 0
    }
    //コンソールに値を表示
    console.log(message)
    //HTMLにデータを表示
    document.getElementById('data_text').innerHTML = message;
}

//--------------------------------------------------
//Start Notify後の処理
//--------------------------------------------------
ble.onStartNotify = function (uuid) {
    console.log("> Start Notify!");

    document.getElementById("uuid_name").innerHTML = uuid;
    document.getElementById("status").innerHTML = "started Notify";
};

//--------------------------------------------------
//Stop Notify後の処理
//--------------------------------------------------
ble.onStopNotify = function (uuid) {
    console.log("> Stop Notify!");

    document.getElementById("uuid_name").innerHTML = uuid;
    document.getElementById("status").innerHTML = "stopped Notify";
};

//-------------------------------------------------
//ボタンが押された時のイベント登録
//--------------------------------------------------
document
    .getElementById("startNotifications")
    .addEventListener("click", function () {
        console.log("console");
        ble.startNotify("UUID1");
    });

function videoStart() {
    video.hidden = false;
    retake.hidden = true;
    canvas.hidden = true;
    form.hidden = true;
    api.hidden = true;
    shuttuer.hidden = false;
    /** カメラ設定 */
    const constraints = {
        audio: false,
        video: {
            facingMode:"environment"// リアカメラを利用する
        },
    };
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            video.srcObject = stream;
            video.onloadedmetadata = (e) => {
                video.play();
            };
        })
        .catch((err) => {
            console.log(err.name + ": " + err.message);
        });
}

function shutter() {
    canvas.hidden = false;
    video.hidden = true;
    shuttuer.hidden = true;
    retake.hidden = false;
    api.hidden = false;
    const ctx = canvas.getContext("2d");
    video.pause(); // 映像を停止
    setTimeout(() => {
        video.play(); // 0.5秒後にカメラ再開
    }, 500);
    // canvasに画像を貼り付ける
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

function giveFunction() {
    let selectedButton = document.querySelectorAll(".selectedButton")
    for(let i = 0; i < selectedButton.length; i++) {
        selectedButton[i].addEventListener("click", function() {
            document.getElementById("foodName").value = selectedButton[i].textContent;
        })
    }
}

window.onload = () => {
    videoStart();
    ble.setUUID(
        "UUID1",
        "21a03e20-cd8a-4a1b-9cb0-f5320ebe873a",
        "476665e7-7dfb-4ab0-8b82-ec59e6a1f37a"
        );
};

document.getElementById("shutter").addEventListener("click", () => {
    shutter()
    base64 = canvas.toDataURL("image/png");
    base64 = base64.replace('data:image/png;base64,','');//余分なdata:image/png;base64を削除
    request = {
        "requests":[{
            "image":{
                "content":base64
            },
            "features":[{
                "type":"TEXT_DETECTION",
                "maxResults":1,
            }]
        }]
    }
});

document.getElementById("api").addEventListener("click", function(){
    retake.hidden = true;
    let weight = document.getElementById("weight");
    console.log("Hello Console");
    $.ajax({
        header: {
            "X-CSRF-TOKEN": $("meta[name='csrf-token']").attr("content")
        },
        url: api_url,
        type: "POST",
        async: true,
        cashe: false,
        data: JSON.stringify(request),
        dataType: "json",
        contentType: "application/json",
        processData: false,
        success: (data) => {
            if(data.responses[0].fullTextAnnotation != null){
                console.log(data)
                matchData = data.responses[0].fullTextAnnotation.text
                let separatedData = matchData.split("\n");
                for(let j = 0; j < foodsName.length; j++) {
                    for(let i = 0; i < separatedData.length; i++) {
                        // let giveData = separatedData[i-1] + separatedData[i] + separatedData[i + 1];
                        if(separatedData.match(foodsName[j]) != null) {
                            apiResult.insertAdjacentHTML("afterbegin", `<div class="btn-success selectedButton">${giveData.match(foodsName[j])}</div>`);
                            console.log(separatedData[i].match(foodsName[j]))
                        }
                    }
                }
                giveFunction();
            }
            canvas.hidden = true;
            api.hidden = true;
            form.hidden = false;
            weight.value = message;
                },
        error: (data) => {
            console.log(data);
        }
    })
    $.ajax({
        type: "POST",
        dataType: "json",
        crossDomain: true,
        header: {
            "X-CSRF-TOKEN": $("meta[name='csrf-token']").attr("content"),
            "Content-Type": "application/json",
        },
        url: "https://api2.foodai.org/v5.0/classify",
        data: {
            image_url: 'data:image/png;base64,' + base64,
            num_tag: 5,
            api_key: "fccc8b7aa11bad14750ab052510b5500fa45170c"
        },
        success: (data) => {
            apiResult.insertAdjacentHTML("afterbegin", `<div class="btn-success selectedButton">${data.food_results[0][0]}</div>`);
            giveFunction();
        },error: (data) => {
            console.log(data);
        },
    });
});

document.getElementById("retake").addEventListener("click",function() {
    shuttuer.hidden = false;
    videoStart();
})

const forms = document.getElementById("forms")
const submitButton = document.getElementById("submit-button")

submitButton.onclick = () => {
    const formData = new FormData(forms)
    const action = forms.getAttribute("action")
    const options = {
    method: 'POST',
    body: formData,
    }
    fetch(action, options).then((e) => {
    if(e.status === 200) {
        alert("保存しました。")
        return
    }
    alert("保存できませんでした。")
    })
}

submitButton.addEventListener("click",function() {
    videoStart();
})
