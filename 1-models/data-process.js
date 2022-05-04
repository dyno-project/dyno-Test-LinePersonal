var isAndroid = kendo.support.mobileOS.android;

//var apiSite = (useLocalAPIs)?'http://localhost:5000':'https://hwbmi-api.herokuapp.com/';
var apiSite = (useLocalAPIs)?'http://localhost:5000':'https://chdr-weight.herokuapp.com/';
console.log(apiSite);

var measurementSource = new kendo.data.DataSource({
  transport: {
    read: function (data) { 取得量測記錄(measurementSource); }
  },
  sort: {
    field: "量測紀錄時間",
    dir: "desc"
  },
  requestStart: function () {
    kendo.ui.progress($("#loading"), true);
  },
  requestEnd: function () {
    kendo.ui.progress($("#loading"), false);
  },

  schema: {
    total: function () {
      console.log("measurementSource scheme total");
      //取得經緯度();    
      return 77;
    }
  },
  serverPaging: true,
  pageSize: 40,
  //group: { field: "section" }
})

async function 取得量測記錄(data) {
  console.log("取得量測記錄");
  
  if (!refresh) {  
    var dataTemp=[];
    data.success(dataTemp);
  } else {
    paramToSend = "?API=33" + "&UserId=" + $("#formHWBMI_ID").val(); 
    console.log(paramToSend);
    resStr = await callAPI(paramToSend, '讀取量測記錄');

    var 所有量測數據=JSON.parse(resStr); 

    var dataTemp=[];
    for (rec in 所有量測數據) {
      var 時間Date = 所有量測數據[rec].measure_time;
      console.log("時間Date", 時間Date);      
      var 卡片 = {
        "量測記錄時間": 時間Date, //所有量測數據[i].量測時間,              
        "身高":    所有量測數據[rec].height,
        "體重":    所有量測數據[rec].net_weight,
        "BMI":    所有量測數據[rec].bmi,             
        "url": "2-views/量測報告.html?"+$("#formHWBMI_ID").val()+"&"+rec,
        "section": "A"             
      };
      dataTemp.push(卡片); 
    }
    
    //data.success(dataTemp.reverse());    
    data.success(dataTemp.sort(function(a,b) {
        if (a.量測記錄時間 < b.量測記錄時間) return  1;
        if (a.量測記錄時間 > b.量測記錄時間) return -1;
        return 0;
      })
    );
    
    //measurementSource.success(dataTemp);    
  }
  
  if (dataTemp.length==0) {
    $("#量測記錄title").text("尚無量測記錄");
  }else {
    $("#量測記錄title").text("量測記錄");
  }  
  //return;
}


function nullForNow(e) {
  console.log("nullForNow");
  //currentExample = nullForNow;
}

function removeView(e) {
  if (!e.view.element.data("persist")) {
    //console.log(e);
    
    // KPC: 找不到 persist 如何設定，只好用粗暴的做法
    if (e.view.id != "#forms") e.view.purge();
    
    //e.view.purge();
  }

}

var desktop = !kendo.support.mobileOS;

window.app = new kendo.mobile.Application($(document.body), {
  layout: "mainDiv",
  transition: "slide",
  skin: "nova",
  icon: {
    "": '@Url.Content("~/content/mobile/AppIcon72x72.png")',
    "72x72": '@Url.Content("~/content/mobile/AppIcon72x72.png")',
    "76x76": '@Url.Content("~/content/mobile/AppIcon76x76.png")',
    "114x114": '@Url.Content("~/content/mobile/AppIcon72x72@2x.png")',
    "120x120": '@Url.Content("~/content/mobile/AppIcon76x76@2x.png")',
    "152x152": '@Url.Content("~/content/mobile/AppIcon76x76@2x.png")'
  }
});