/******************DB関連**********************/
let version = "1.0";
let db = "";
const dbname = "todoDB";
const objectstorename = "todo";

//IndexedDBの実装チェックとプレフィックスやイベント・ハンドラの登録
if (window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB) {
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.mozIDBTransaction;
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange;
    var IDBCursor = window.IDBCursor || window.webkitIDBCursor;

    //IDBRequestの取得
    var IDBreq = indexedDB.open(dbname,version);

} else {
    //IndexedDB非対応
    window.alert("このブラウザでは利用できません");
}
//IDBDatabaseの取得
IDBreq.onsuccess = function (event) {
    db = this.result;
    console.log("onsuccess");
    before();
    current();
    after();
    Disp();
    showvalue();
}
//データベースを持っていない場合にトリガーされる
IDBreq.onupgradeneeded = function (event) {
    console.log("onupgradeneeded");
    db = this.result;
    if (!db.objectStoreNames.contains(objectstorename)) {
        console.log("onupgradeneeded-in");
        var store = db.createObjectStore(objectstorename, { keyPath: "Date", autoIncrement: false });
        store.createIndex("Date", "Date");
    }
    /*before();
    current();
    after();
    Disp();*/
}
IDBreq.onerror = function (event) {
    console.log("error");
}
// 値の取得時に呼び出されるコールバック関数
function showvalue() {
    // （6）トランザクションを利用してオブジェクトの取得
    let trans = db.transaction(objectstorename, "readonly");
    let store = trans.objectStore(objectstorename);
    let req = store.get(keydate);
    //var ul = document.getElementById("list");
    req.onsuccess = function (event) {
        if (this.result === undefined) {
        //alert("そのキーで保存されているブックマークはありません");
        } else {
            this.result.todos.forEach(todo => {
                add(todo);
            });
        }
    }
}
//初回とカレンダー月変更時の値の取得時に呼び出されるコールバック関数
function showvalue2(output_calendar) {

    let trans = db.transaction(objectstorename, "readonly");
    let store = trans.objectStore(objectstorename);
    let req = store.get(output_calendar);
    
    req.onsuccess = function (event) {
        if (this.result === undefined) {
        //alert("そのキーで保存されているブックマークはありません");
        } else {
            calendaradd(this.result.Date,this.result.todos);
        }
    }
}
/************************************************/

const h1 = document.getElementById("today");
const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

//カレンダーに表示する日付情報を格納する変数
let arr = [];

let table = document.createElement('table');

let thead = document.createElement('thead');
let tbody = document.createElement('tbody');
table.appendChild(thead);
table.appendChild(tbody);
//bodyにテーブルを追加
table.classList.add("w-100");
table.classList.add("h-100");
table.setAttribute("cellspacing","15");
document.getElementById('calendar').appendChild(table);
class content {
    constructor(year, month, date, day) {
        this.year = year;
        this.month = month;
        this.date = date;        
        this.day = day;
    }
}
const clickdate = document.getElementById("tododate");
const form = document.getElementById("form");
const input = document.getElementById("input");
const ulselect = document.getElementById("ulselect")

//const todos = JSON.parse(localStorage.getItem("todos"));

//現在の日付を取得
const today = new Date();

h1.innerText = today.getFullYear() +"年"+ (today.getMonth()+1) +"月";//getMonth()は0-11を返すgetDay()は0-6を返す
clickdate.innerText = today.getFullYear() +"年"+ (today.getMonth()+1) +"月"+today.getDate()+"日"+"("+ChangeDay(today.getDay())+")";
//クリックした日付情報を格納する変数(現在選択中の日付)
let pushdate = new content(today.getFullYear(),today.getMonth(),today.getDate(),today.getDay());
let keydate = pushdate.year+addzero(pushdate.month)+addzero(pushdate.date);

//今月最初の日
let firstDate = new Date(today.getFullYear(), (today.getMonth()), 1);
//今月最終日
let lastDate = new Date(today.getFullYear(), (today.getMonth()+1), 0);//日の指定を0にすると前月の最終日を取得するのでgetMonthは+1する

let crtfirstDate = firstDate;
let crtlastDate = lastDate;

//前月の日数を取得するための準備
let prevlastDate = new Date(crtfirstDate.getFullYear(), crtfirstDate.getMonth(), 0);
//次月
let NextDate = new Date(crtfirstDate.getFullYear(), crtfirstDate.getMonth()+1, 1);

let rowname = "row";
let rowcnt=0;
let rowid="";
let targettrid ="";
let targettdid ="";
/*
if(todos){
    todos.forEach(todo => {
        add(todo);
    });
}
*/
form.addEventListener("submit", function(event) {
    event.preventDefault();
    //console.log(input.value);
    add();
});

function before(){
    //表示する月の最初の日付けが日曜でない時
    if(crtfirstDate.getDay()!==0){
        let stDate = prevlastDate.getDate() - prevlastDate.getDay();
        let getdate = "";
        console.log("前方");
        for(let i=0; i<=prevlastDate.getDay(); i++) {
            //console.log(prevlastDate.getFullYear() +"年"+ (prevlastDate.getMonth()+1) +"月"+ (stDate + i));
            getdate = new Date(prevlastDate.getFullYear(),prevlastDate.getMonth(),(stDate + i));
            arr.push(new content(getdate.getFullYear(),getdate.getMonth(),getdate.getDate(),getdate.getDay()));
        }
    }
}
function current(){
    let getdate = "";
    for(let i=1; i<=crtlastDate.getDate();i++){
        getdate = new Date(crtlastDate.getFullYear(),crtlastDate.getMonth(),i);
        arr.push(new content(getdate.getFullYear(),getdate.getMonth(),getdate.getDate(),getdate.getDay()));
    }
}

function after(){
    //表示する月の最後の日付けが土曜でない時
    if(crtlastDate.getDay() !== 6) {
        let cnt = 1;
        let getdate = "";
        console.log("後方");
        for(let i=(crtlastDate.getDay()+1); i<=6; i++){
            //console.log(NextDate.getFullYear()+"年"+(NextDate.getMonth()+1)+"月"+cnt+"日");
            getdate = new Date(NextDate.getFullYear(),NextDate.getMonth(),cnt);
            arr.push(new content(getdate.getFullYear(),getdate.getMonth(),getdate.getDate(),getdate.getDay()));
            cnt++;
        }
    }
}

//次の月or前の月を表示
function MonthSel(){
    clearTbl();
    arr.length = 0;
    rowcnt=0;
    rowid="";
    targettrid ="";

    if(this.val === "prev"){
        crtfirstDate = new Date(crtfirstDate.getFullYear(),(crtfirstDate.getMonth()-1),1);
    }else{
        crtfirstDate = new Date(crtfirstDate.getFullYear(),(crtfirstDate.getMonth()+1),1);
    }
    crtlastDate = new Date(crtfirstDate.getFullYear(),(crtfirstDate.getMonth()+1),0);
    prevlastDate = new Date(crtfirstDate.getFullYear(), crtfirstDate.getMonth(), 0);
    NextDate = new Date(crtfirstDate.getFullYear(), crtfirstDate.getMonth()+1, 1);
    console.log("前月："+prevlastDate.getFullYear()+"/"+(prevlastDate.getMonth()+1));
    console.log("現在："+crtfirstDate.getFullYear()+"/"+(crtfirstDate.getMonth()+1));
    console.log("次月："+NextDate.getFullYear()+"/"+(NextDate.getMonth()+1));
    before();
    current();
    after();
    Disp();
}

//カレンダー表示
function Disp(){
    trins();
    weekDays.forEach((weekDay,index) => {
        const th = document.createElement("th");
        const thdiv = document.createElement("div");
        const thp = document.createElement("p");
        
        thdiv.setAttribute("class", "thdiv");
        thp.setAttribute("class", "thp");
        
        if(index === 0){
            thp.classList.add("text-danger");
        }else if(index === 6){
            thp.classList.add("text-primary");
        }
        thp.textContent = weekDay;
        th.appendChild(thdiv);
        th.appendChild(thp);
 
        targettrid.appendChild(th);
    });
    targettrid.classList.add("trth")
    rowcnt++;
    trins();
    arr.forEach((content,index,array) => {
        const td = document.createElement("td");
        let formatteddate = content.year.toString()+addzero(content.month)+addzero(content.date);
        targettrid.classList.add("trtd")
        if(ColorCheck(index)!==""){
            td.setAttribute("class", ColorCheck(index));
        }
        //今日の日付の場合
        if((today.getFullYear() === content.year)&&(today.getMonth() === content.month)&&(today.getDate() === content.date)){
            td.classList.add("border","border-danger");
        }
        //セルクリックでpushButton関数を実行
        td.setAttribute("onclick", "pushButton("+(index)+")");

        let divdate = document.createElement("div");
        const p = document.createElement("p");
        p.appendChild(document.createTextNode(content.date));
        if(ColorCheck(index)!==""){
            divdate.setAttribute("class", ColorCheck(index));
        }
        if(crtfirstDate.getMonth()!== content.month){
            p.classList.add("notcrtMonth");
        }
        divdate.classList.add("divdate");
        divdate.appendChild(p);

        let divtodo = document.createElement("div");
        divtodo.classList.add("divtodo");
        let ultodo = document.createElement("ul");
        ultodo.setAttribute("id", formatteddate);
        divtodo.appendChild(ultodo);

        showvalue2(formatteddate);

        td.appendChild(divdate);
        td.appendChild(divtodo);
        targettrid.appendChild(td);
        //土曜日で行追加
        if(content.day === 6){
            if(index !== array.length - 1){
                rowcnt++;
                trins();
            }
        }
    });
    h1.innerText = crtfirstDate.getFullYear() +"年"+ (crtfirstDate.getMonth()+1) +"月";//getMonth()は0-11を返すgetDay()は0-6を返す
}
//行を追加する関数
function trins(){
    rowid = rowname+rowcnt;
    const tr = document.createElement("tr");
    tr.setAttribute("id",rowid);
    table.appendChild(tr);
    targettrid = document.getElementById(rowid);
}
function clearTbl() {
    let tbelements = document.getElementsByTagName("table");
    for (let i = 0; i < tbelements.length; i++) {
        while (tbelements[i].rows.length > 0) {
            tbelements[i].deleteRow(0);
        }
    }
}
function pushButton(index) {
    let cont = new content(arr[index].year,arr[index].month,arr[index].date,arr[index].day);
    //console.log(arr[index]);
    clickdate.innerText = cont.year +"年"+ (cont.month+1) +"月"+cont.date+"日"+"("+ChangeDay(cont.day)+")";
    pushdate = cont;
    console.log(pushdate.year);
    keydate = pushdate.year.toString()+addzero(pushdate.month)+addzero(pushdate.date);
    
    //todoリスト表示初期化
    while(ulselect.firstChild){
        ulselect.removeChild(ulselect.firstChild);
    }

    showvalue();
    
}
//土曜、日曜に色を付ける
function ColorCheck(index) {
    let textcolor = "";
    if(arr[index].day === 0){
        textcolor = "text-danger";
    }else if(arr[index].day === 6){
        textcolor = "text-primary";
    }
    return textcolor;
}
function ChangeDay(day){
    let text = "";
    text = weekDays[day];
    return text;
}
function add(todo){

    let todoText = input.value;

    if(todo){
        todoText = todo.text;
    }

    if (todoText){//todoText.length > 0を省略（暗黙的型変換）
        const li = document.createElement("li");
        li.innerText = todoText;
        li.classList.add("list-group-item");

        if(todo && todo.completed){
            li.classList.add("text-decoration-line-through");
        }

        li.addEventListener("contextmenu" ,function(event){
            event.preventDefault();
            li.remove();
            saveData();
        });

        li.addEventListener("click" ,function(event){
            li.classList.toggle("text-decoration-line-through");
            saveData();
        });

        ulselect.appendChild(li);
        input.value = "";
        saveData();
    }
}
function calendaradd(date,todos){
    console.log("caladdin");
    let ultodo = document.getElementById(date);
    ultodo.classList.add("list-unstyled");
    while(ultodo.firstChild){
        ultodo.removeChild(ultodo.firstChild);
    }
    todos.forEach(todo => {
        const li = document.createElement("li");
        const div= document.createElement("div");
        div.innerText = todo.text;
        
        //li.classList.add("list-group-item");

        if(todo && todo.completed){
            div.classList.add("text-decoration-line-through");
        }
        div.classList.add("listdiv");
        li.appendChild(div);
        ultodo.appendChild(li);
    });
}
function saveData(){
    const lists = document.getElementById("ulselect");
    const list = lists.children;

    let todos = [];
    
    keydate = pushdate.year.toString()+addzero(pushdate.month)+addzero(pushdate.date);

    for(let i= 0; i<list.length; i++) {
        let todo = {
            text: list[i].innerText,
            completed: list[i].classList.contains("text-decoration-line-through")
        }
        todos.push(todo);
    }
    
    let trans = db.transaction(objectstorename, "readwrite");
    let store = trans.objectStore(objectstorename);

    if(todos.length !== 0){
        let data = { Date: keydate, todos: todos};
        let request = store.put(data);
    }else{
        let request = store.delete(keydate);
    }
    //カレンダーのリスト更新
    if(document.getElementById(keydate) != null){
        calendaradd(keydate,todos);
    }
    //localStorage.setItem("todos", JSON.stringify(todos));
}
function addzero(num){
    if( (0<=num) && (num <=9)){
        num = "0"+num;
    }else{
        num.toString();
    }
    return num;
}
document.getElementById("left").addEventListener("click", {val: 'prev',handleEvent: MonthSel});
document.getElementById("right").addEventListener("click", {val: "next",handleEvent: MonthSel});