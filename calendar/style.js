const week = ["日","月","火","水","木","金","土"];
const today = new Date();
//月末だとズレる可能性があるため、1日固定で取得
var showDate = new Date(today.getFullYear(),today.getMonth(),1);

//祝日取得
var request;
window.onload = function() {
    request = new XMLHttpRequest();
    request.open('get','syukujitsu.csv',true);
    request.send(null);
    request.onload = function() {
        //初期表示
        showProcess(today, calendar);
    };
};

//前の月表示
function prev() {
    showDate.setMonth(showDate.getMonth()-1);
    showProcess(showDate);
}
//次の月表示
function next() {
    showDate.setMonth(showDate.getMonth()+1);
    showProcess(showDate);
}

//カレンダー表示
function showProcess(date) {
    var year = date.getFullYear();
    var month = date.getMonth();//0が始まり
    document.querySelector('#header').innerHTML = year + "年" + (month+1) + "月";

    var calendar = createProcess(year,month);
    document.querySelector('#calendar').innerHTML = calendar;
}

//カレンダー作成
function createProcess(year,month) {
    //曜日
    var calendar = "<table><tr class='dayOfWeek'>";
    for (var i = 0;i < week.length;i++) {
        calendar += "<th>" + week[i] + "</th>";
    }
    calendar += "</th>";

    var count = 0;
    var startDayOfWeek = new Date(year,month, 1).getDay();
    var endDate = new Date(year,month + 1,0).getDate();
    var lastMonthEndDate = new Date(year,month,0).getDate();
    var row = Math.ceil((startDayOfWeek + endDate)/week.length);

    //1行ずつ設定
    for (var i = 0;i < row;i++) {
        calendar += "<tr>";
        //1column単位で設定
        for (var j = 0;j < week.length;j++) {
            if (i == 0 && j < startDayOfWeek) {
                //1行目で1日まで先月の日付を設定
                calendar += "<td class='disabled'>"+(lastMonthEndDate - startDayOfWeek + j + 1) + "</td>";
            } else if (count >= endDate) {
                //最終行で最終日以降、翌月の日付を設定
                count++;
                calendar += "<td class='disabled'>" + (count - endDate) + "</td>";
            } else {
                //当月の日付を曜日に照らし合わせて設定
                count++;
                var dateInfo = checkDate(year,month,count);
                if (dateInfo.isToday) {
                    calendar += "<td class='today'>" + count + "</td>";
                } else if (dateInfo.isHoliday) {
                    calendar += "<td class='holiday' title='" + dateInfo.holidayName + "'>" + count + "</td>";
                } else {
                    calendar += "<td>" + count + "</td>";
                }
                /*
                if (year == today.getFullYear() && month == (today.getMonth()) && count == today.getDate()) {
                    calendar += "<td class='today'>" + count + "</td>";
                } else {
                    calendar += "<td>" + count + "</td>";
                }
                */
            }
        }
        calendar += "</tr>";
    }
    return calendar;
}

//日付チェック
function checkDate(year,month,day) {
    if (isToday(year,month,day)) {
        return {
            isToday:true,
            isHoliday:false,
            holidayName:""
        };
    }

    var checkHoliday = isHoliday(year,month,day);
    return {
        isToday:false,
        isHoliday:checkHoliday[0],
        holidayName:checkHoliday[1],
    };
}

//当日かどうか
function isToday(year,month,day) {
    return (year == today.getFullYear() && month == (today.getMonth()) && day == today.getDate());
}

//祝日かどうか
function isHoliday(year,month,day) {
    var checkDate = year + '/' + (month + 1) + '/' + day;
    var dateList = request.responseText.split('\n');
    //1行目はヘッダーのため初期値1で開始
    for (var i = 1;i < dateList.length;i++) {
        if (dateList[i].split(',')[0] === checkDate) {
            return [true,dateList[i].split(',')[1]];
        }
    }
    return [false,""];
}