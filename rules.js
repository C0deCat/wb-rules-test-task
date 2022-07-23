//Определяем виртуальное устройство с переключателем
defineVirtualDevice("HAVAC_test", {
    title: 'HAVAC_test',
    cells: {
        enabled: {
            type: "switch",
            value: true
        }
    }
});

//подписываем EXT1_R3A1 на изменения в HAVAC_test
trackMqtt("/devices/HAVAC_test/controls/enabled", function(msg) {
    dev["wb-gpio"]["EXT1_R3A1"] = msg.value;
});

//Значение HAVAC_test может быть true если контрол A1_IN в значении true. 
//В противном случае HAVAC_test переходит в значение false, 
//в логи выводим ALARM A1_IN.
defineRule({
    whenChanged: "wb-gpio/A1_IN",
    then: function() {
        if (!dev["wb-gpio"]["A1_IN"]) {
            dev["HAVAC_test"]["enabled"] = false;
            log("ALARM A1_IN");
        }
    }
});

//В случае если через 20 секунд после смены значения виртуального устройства 
//HVAC_test, значение контрола A2_IN - false, значение HVAC_test переходит в false, 
//в логи выводим ALARM A2_IN.
//При значении HAVAC_test - true проверяем показания датчика температуры 
//(контрол 28-00000d6b460c), если значение больше 25, контрол Channel 1 
//показывает значение 8000, меньше или равно - значение 2000.
//HAVAC_test в значении false - Channel 1 в значении 0.
defineRule({
    whenChanged: "HAVAC_test/enabled",
    then: function() {
        setTimeout(function(){
            if(!dev["wb-gpio"]["A2_IN"]) {
                dev["HAVAC_test"]["enabled"] = false;
                dev["wb-mao4_209"]["Channel 1"] = 0;
                log("ALARM A2_IN");
            }
        }, 20000);
        if(devdev["HAVAC_test"]["enabled"]) {
            if(dev["wb-w1"]["28-00000d6b460c,"] > 25) {
                dev["wb-mao4_209"]["Channel 1"] = 8000;
            }
            else {
                dev["wb-mao4_209"]["Channel 1"] = 2000;
            }
        }
        else {
            dev["wb-mao4_209"]["Channel 1"] = 0;
        }
    }
});