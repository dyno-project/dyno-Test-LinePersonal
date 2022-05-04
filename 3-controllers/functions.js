// MM/DD/YYYY ==> YYYY-MM-DD
function convertDate(dateStr){ 
  var dateArr = dateStr.split("/");
  // Kendo UI Calendar 的日期是類似 2/9/2020，月和日不會補0
  //if (dateArr[0].length ==1) dateArr[0]= "0"+dateArr[0];
  //if (dateArr[1].length ==1) dateArr[1]= "0"+dateArr[1];
  return dateArr[2]+"-"+dateArr[0]+"-"+dateArr[1];
}

// 設定 $a enabled 或 disabled
function setEnabled($a, Enabled ){
  $a.each(function(i, a){          
    var en = a.onclick !== null;        
    if(en == Enabled)return;
    if(Enabled){
      a.onclick = $(a).data('orgClick');            
    }
    else
    {
      $(a).data('orgClick',a.onclick);
      a.onclick = null;
    }
  });
}

function 取得經緯度() {
  navigator.geolocation.getCurrentPosition(function (position) {
    console.log(position.coords.latitude, position.coords.longitude);
    目前位置緯度 = Math.floor(position.coords.latitude * 10000) / 10000;
    目前位置經度 = Math.floor(position.coords.longitude * 10000) / 10000;
    $("#deleteMe").text("所在位置 緯度: " + String(目前位置緯度) + ", 經度: " + String(目前位置經度));
  });
}

// 計算 兩點 間的距離
function calcDistance(lat1, lon1, lat2, lon2) {
  var R = 6371000; // meter
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) 
{
    return Value * Math.PI / 180;
}


async function 更新資料() {
  console.log("更新資料");
 
  await 註冊會員();
  console.log(已經是會員);
  
  app.navigate('#:back');
}

// 非同步+await
function callAPI(param, loadingMessage) {
  return new Promise(function(resolve, reject) {       
    var request = new XMLHttpRequest();
    request.open('GET', apiSite +param, true);

    request.onload = function() {
      if (loadingMessage!="") $.loading.end();
      //console.log(this.response);

      resolve(this.response);
    }
    // Send API request 
    if (loadingMessage!="") $.loading.start(loadingMessage);

    request.send();    
  });
}

async function checkUserIdExist() {

  $.loading.start('檢查是否已註冊');
  paramToSend = "?API=04" + "&LineId=" + userId[1];

  console.log(apiSite);
  
  var res;
  var resStr = await callAPI(paramToSend, '檢查是否已填寫必要資料'); 
  $.loading.end();
  
  res = JSON.parse(resStr);
  console.log(res);
  if (res.error=="NoFund") {
    console.log("Not Found");
    alert("為了讓您更容易查詢，請註冊姓名及電話號碼");
    $("#formUserName").val(decodeURI(displayName[1]));
    $("#formUserName").attr("disabled", "disabled"); 
    $("#LINE頭像").attr("src", pictureUrl[1]);
    $("#formHWBMI_ID").val(res.newId);    
    已經是會員 = false; 
    app.navigate('#forms'); 
    return;
  } else { // 已經是會員    
    $("#formUserName").val(decodeURI(displayName[1]));
    $("#formUserName").attr("disabled", "disabled"); 
    $("#LINE頭像").attr("src", pictureUrl[1]); 
    $("#formUserPhone").val(res.電話);
    $("#formHWBMI_ID").val(res.Id);
    console.log(res)
    已經是會員 = true;     
  }
      
  取得量測記錄(measurementSource);
  refresh=true;
  measurementSource.read(); // 產生 sorting 
  //$.loading.end(); 
  
  // show barcode
  var hwBMI_ID=$("#formHWBMI_ID").val();
  JsBarcode("#barcode", hwBMI_ID, {
    displayValue: false,
    width:2,
    height:70
  });   
  
  return;
  
}

async function 註冊會員() {
  console.log("註冊會員");
  // 檢查資料格式     
  if (   $("#formUserName").val()        == ""
      || $("#formUserPhone").val()       == ""      
     ) {
    alert("請填寫必填項目!");
    
    return false;
  }

  var profile = "請確認註冊資料:\n" +
    "    姓名: " + $("#formUserName").val() + "\n" +                 
    "    電話: " + $("#formUserPhone").val() + "\n";       

  if (confirm(profile)) {

    // 先綁定 ID, 名字和電話
    paramToSend = "?API=01" +
      "&UserId="            + $("#formHWBMI_ID").val()+  
      "&Name="              + $("#formUserName").val()+  
      "&Phone="             + $("#formUserPhone").val();  
  
    console.log(paramToSend); 
    
    var res = await callAPI(paramToSend, '寫入資料');

    if (res == "API:01 會員寫入成功") {
      //alert("資料更新成功，回到量測頁面");
      //checkUserIdExist();
      //已經是會員 = true;
    } else {
      alert("資料新增失敗，請重試。若一直有問題，請洽管理員")
      $("#errorMessage").css("display", "block");
      return;
    }
    
    // 再綁定 LineID 和 UserID
    paramToSend = "?API=03" +
      "&LineId="           + userId[1] +
      "&UserId="           + $("#formHWBMI_ID").val();  

    console.log(paramToSend); 
    
    var res = await callAPI(paramToSend, '寫入資料');
    
    if (res == "API:03 會員資料Line綁定hwBMI寫入成功") {
      alert("資料更新成功，回到量測頁面");
      checkUserIdExist();
      已經是會員 = true;
    } else {
      alert("資料新增失敗，請重試。若一直有問題，請洽管理員")
      $("#errorMessage").css("display", "block");
    }    

  } else {
    console.log("Cancel");
  };
  
};

function checkInputParam() {
  //console.log(inputParam);
  try {
    displayName = inputParam[0].split("=");
    userId = inputParam[1].split("=");
    pictureUrl = inputParam[2].split("=");
  } catch (e) {
    inputError = true;
  }

  //console.log(displayName[1]);

  if (inputError) {
    alert("輸入參數錯誤");
    loadCourses = false;

    // 等 #mainDiv 顯示後，再 hide()
    setTimeout(function(){$("#mainDiv").hide();}, 500);

    $("#errorMessage").css("display", "block"); 
    return false;
  }
    return true;
}

function 顯示個人資料同意書() {
  console.log("顯示個人資料同意書");
  $("#formData").hide();
  $("#個人資料使用Div").hide();
  $("#個人資料同意書Div").show();
}

function 我知道了(){
  $("#formData").show();
  $("#個人資料使用Div").show();  
  $("#個人資料同意書Div").hide();      
}