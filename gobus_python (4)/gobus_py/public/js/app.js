/* ======================== DATA (tải từ backend qua API) ======================== */
const API = "/api";
// Các mảng này được nạp bằng fetch() từ server khi ứng dụng khởi động (xem hàm boot() cuối file).
// Trước khi tải xong, chúng là mảng rỗng để tránh lỗi khi render lần đầu.
let ROUTES = [];
let DEMO_BOOKINGS = [];
let DEMO_PASSES = [];
let DEMO_DRIVERS = [];
let DEMO_PROMOS = [];

// Cấu hình tĩnh, ít thay đổi nên vẫn giữ ở client (không cần gọi API)
const PASS_PLANS=[
  {id:"1m",label:"1 tháng",months:1,price:200000,type:"single"},
  {id:"3m",label:"3 tháng",months:3,price:540000,save:"Tiết kiệm 60.000đ",type:"single"},
  {id:"6m",label:"6 tháng",months:6,price:1000000,save:"Tiết kiệm 200.000đ",type:"single"},
  {id:"1m-multi",label:"1 tháng (Liên tuyến)",months:1,price:400000,type:"multi",badge:"Tất cả tuyến"},
  {id:"3m-multi",label:"3 tháng (Liên tuyến)",months:3,price:1080000,save:"Tiết kiệm 120.000đ",type:"multi",badge:"Tất cả tuyến"},
  {id:"6m-multi",label:"6 tháng (Liên tuyến)",months:6,price:2000000,save:"Tiết kiệm 400.000đ",type:"multi",badge:"Tất cả tuyến"},
];
const WEEKDAYS=["CN","T2","T3","T4","T5","T6","T7"];

/* ---------- Lớp gọi API tới backend ---------- */
async function apiGet(path){const r=await fetch(API+path);if(!r.ok)throw new Error("Lỗi tải dữ liệu: "+path);return r.json()}
async function apiSend(method,path,body){
  const r=await fetch(API+path,{method,headers:{"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||("Lỗi gọi API: "+path))}
  return r.status===204?null:r.json();
}

/* ======================== HELPERS ======================== */
function getRoute(id){return ROUTES.find(r=>r.id===id)}
function getStopNames(){return Array.from(new Set(ROUTES.flatMap(r=>r.stops.map(s=>s.name)))).sort((a,b)=>a.localeCompare(b,"vi"))}
function timeToMinutes(t){const[h,m]=t.split(":").map(Number);return h*60+m}
function minutesToTime(m){const mm=((m%1440)+1440)%1440,h=Math.floor(mm/60),min=mm%60;return String(h).padStart(2,"0")+":"+String(min).padStart(2,"0")}
function generateSchedule(r){const t=[];let c=timeToMinutes(r.hours.start);const e=timeToMinutes(r.hours.end);while(c<=e){t.push(minutesToTime(c));c+=r.frequency}return t}
function nextDepartures(r,stop,now,n){n=n||4;const s=r.stops.find(x=>x.name===stop)||r.stops[0];const sc=generateSchedule(r);const nm=now.getHours()*60+now.getMinutes();const ts=sc.map(t=>(timeToMinutes(t)+s.t)%1440).sort((a,b)=>a-b);let up=ts.filter(m=>m>=nm);if(up.length<n)up=up.concat(ts.slice(0,n-up.length));return up.slice(0,n).map(minutesToTime)}
function findRoutes(o,d){return ROUTES.filter(r=>r.stops.some(s=>s.name===o)&&r.stops.some(s=>s.name===d))}
function findCommonStops(r1,r2){return r1.stops.filter(s1=>r2.stops.some(s2=>s2.name===s1.name)).map(s=>s.name)}
function findMultiRoutes(o,d){
  // Tìm đường đi qua 2 tuyến: origin -> (trạm trung chuyển) -> destination
  const results=[];
  for(let r1 of ROUTES){
    if(!r1.stops.some(s=>s.name===o)) continue;
    for(let r2 of ROUTES){
      if(r2.id===r1.id) continue;
      if(!r2.stops.some(s=>s.name===d)) continue;
      const common=findCommonStops(r1,r2);
      for(let stop of common){
        const t1=segDuration(r1,o,stop);
        const t2=segDuration(r2,stop,d);
        if(t1!==null&&t2!==null){
          results.push({routes:[r1,r2],transfer:stop,leg1:{from:o,to:stop,route:r1,duration:t1},leg2:{from:stop,to:d,route:r2,duration:t2},totalDuration:t1+t2,totalPrice:r1.price+r2.price});
        }
      }
    }
  }
  results.sort((a,b)=>a.totalDuration-b.totalDuration);
  return results.slice(0,5);
}
function segDuration(r,o,d){const a=r.stops.find(s=>s.name===o),b=r.stops.find(s=>s.name===d);return a&&b?Math.abs(b.t-a.t):null}
function fmtVND(n){return n.toLocaleString("vi-VN")+" đ"}
function fmtDate(d){return WEEKDAYS[d.getDay()]+", "+String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0")+"/"+d.getFullYear()}
function addMonths(d,n){const r=new Date(d);r.setMonth(r.getMonth()+n);return r}
function genId(){return"GB"+Math.random().toString(36).slice(2,8).toUpperCase()}
function icon(n,s,c){s=s||18;return`<i data-lucide="${n}" style="width:${s}px;height:${s}px;display:inline-block;vertical-align:middle${c?';color:'+c:''}"></i>`}
function miniLine(color){return`<div class="vg-mini-line"><div class="vg-mini-line-fill" style="background:linear-gradient(90deg,${color}33,${color})"></div><div class="vg-mini-line-dot" style="background:${color}"></div></div>`}
function qrHTML(seed){let x=0;for(let i=0;i<seed.length;i++)x+=seed.charCodeAt(i)*(i+7);let h="";for(let i=0;i<64;i++){x=(x*1103515245+12345)%2147483648;const c=(i<3||(i>4&&i<8)||(i>=16&&i<19)||(i>=21&&i<24)||(i>=48&&i<51)||(i>=53&&i<56));h+=`<div class="vg-qr-cell" style="background:${(c||x%5===0)?"var(--ink)":"transparent"}"></div>`}return h}
async function applyPromo(base,code){
  if(!code)return null;
  try{
    const r=await apiSend("POST","/apply-promo",{base,code});
    return r.after;
  }catch(err){return null}
}

const NOW=new Date();
const TODAY=fmtDate(NOW);
let STOP_NAMES=getStopNames();
let STUDENT_DISCOUNT={trip_discount:0.30,pass_discount:0.20}; // Mặc định, sẽ load từ API

/* ======================== STATE ======================== */
const S={
  view:"home",history:[],
  origin:"",destination:"",
  activeRouteId:null,selectedTime:null,passengerCount:1,
  selectedPlan:null,tickets:[],confirmedTicketId:null,ticketsTab:"trip",
  favorites:new Set(),
  useStudentPrice:false, // Bật/tắt giá sinh viên
  notifications:[
    {id:"n1",unread:true,icon:"bus",color:"#1FAE7C",title:"Xe E03 sắp đến trạm!",sub:"Còn khoảng 3 phút · Vinhomes Ocean Park 1",time:"Vừa xong"},
    {id:"n2",unread:true,icon:"ticket",color:"#0B3D36",title:"Đặt vé thành công",sub:"Vé lượt E05 · 08:00 hôm nay",time:"5 phút trước"},
    {id:"n3",unread:false,icon:"wallet",color:"#3C7CD9",title:"Thẻ tháng sắp hết hạn",sub:"Thẻ tuyến E03 hết hạn sau 7 ngày",time:"2 giờ trước"},
    {id:"n4",unread:false,icon:"star",color:"#F59E0B",title:"Đánh giá chuyến đi",sub:"Bạn có muốn đánh giá chuyến E09 hôm qua?",time:"1 ngày trước"},
  ],
  ratingTarget:null,ratingStars:0,ratingComment:"",
  trackRouteId:null,trackBusPos:0,trackInterval:null,
  promoCode:"",promoApplied:null,
  historyTrips:[
    {id:"GB9X1Y2Z",routeCode:"E03",color:"#1FAE7C",from:"Vinhomes Ocean Park 1",to:"Long Biên",time:"07:15",date:"T2, 16/06/2026",total:9000,rating:5},
    {id:"GB3A4B5C",routeCode:"E05",color:"#1FAE7C",from:"Vinhomes Smart City",to:"Hồ Gươm",time:"08:00",date:"CN, 15/06/2026",total:18000,rating:4},
    {id:"GB6D7E8F",routeCode:"09A",color:"#3C7CD9",from:"Hồ Gươm",to:"Cầu Giấy",time:"17:30",date:"T7, 14/06/2026",total:7000,rating:0},
  ],
  /* Admin */
  adminSection:"overview",adminModal:null,
  adminPeriod:"week",
  promoModalOpen:false,driverModalOpen:false,
  adminPwError:"",adminPwSuccess:"",
  /* Tài khoản */
  currentUser:null,currentAdmin:null,authError:"",authView:"login",
  /* Sinh viên */
  studentVerifyError:"",studentVerifySuccess:"",
};

function getBoarding(){const r=getRoute(S.activeRouteId);if(!r)return null;return S.origin&&r.stops.some(s=>s.name===S.origin)?S.origin:r.stops[0].name}
function getAlighting(){const r=getRoute(S.activeRouteId);if(!r)return null;return S.destination&&r.stops.some(s=>s.name===S.destination)?S.destination:r.stops[r.stops.length-1].name}
function unreadCount(){return S.notifications.filter(n=>n.unread).length}
function isStudentVerified(){return S.currentUser&&S.currentUser.student_verified==true}
function getStudentDiscountRate(type){return type==="pass"?STUDENT_DISCOUNT.pass_discount:STUDENT_DISCOUNT.trip_discount}
function calcStudentPrice(base,type){const rate=getStudentDiscountRate(type);return Math.round(base*(1-rate))}

/* ======================== APP CONTROLLER ======================== */
const App={
  nav(v){this._leaveTracking(v);S.history.push(S.view);S.view=v;render()},
  back(){const l=S.history.pop()||"home";this._leaveTracking(l);S.view=l;render()},
  tab(v){this._leaveTracking(v);S.history=[];S.view=v;render()},
  _leaveTracking(nextView){
    if(S.view==="tracking"&&nextView!=="tracking"){
      if(S.trackInterval){clearInterval(S.trackInterval);S.trackInterval=null}
      TRACK_MAP=null;TRACK_MARKER=null;
    }
  },
  clearAuthErrorAndGo(view){S.authError="";this.tab(view)},
  async doLogin(){
    const email=document.getElementById("li-email")?.value.trim();
    const password=document.getElementById("li-password")?.value;
    if(!email||!password){S.authError="Vui lòng nhập email và mật khẩu.";render();return}
    try{
      const user=await apiSend("POST","/auth/login",{email,password});
      S.currentUser=user;S.authError="";
      // Load tickets/passes từ API sau login
      try{
        const [bookings,passes]=await Promise.all([apiGet("/my-bookings"),apiGet("/my-passes")]);
        S.tickets=[...bookings.map(b=>({id:b.id,type:"trip",routeCode:b.routeCode,routeName:"",color:"#1FAE7C",from:"",to:"",time:b.time,date:b.date,count:b.count,total:b.total})),...passes.map(p=>({id:p.id,type:"pass",routeCode:p.routeCode,routeName:"",color:"#3C7CD9",planLabel:p.planLabel,total:p.total,purchaseDate:p.purchaseDate,expiry:p.expiry}))];
      }catch(e){console.error(e);}
      this.tab("other");
    }catch(err){S.authError=err.message;render();}
  },
  async doRegister(){
    const name=document.getElementById("rg-name")?.value.trim();
    const email=document.getElementById("rg-email")?.value.trim();
    const phone=document.getElementById("rg-phone")?.value.trim();
    const password=document.getElementById("rg-password")?.value;
    if(!name||!email||!password){S.authError="Vui lòng nhập đầy đủ thông tin.";render();return}
    try{
      const user=await apiSend("POST","/auth/register",{name,email,phone,password});
      S.currentUser=user;S.authError="";this.tab("other");
    }catch(err){S.authError=err.message;render();}
  },
  async doLogout(){
    try{await apiSend("POST","/auth/logout")}catch(e){}
    S.currentUser=null;S.tickets=[];S.useStudentPrice=false;render();
  },
  setOrigin(v){S.origin=v;render()},
  setDestination(v){S.destination=v;render()},
  swap(){const o=S.origin;S.origin=S.destination;S.destination=o;render()},
  search(){if(!S.origin||!S.destination||S.origin===S.destination)return;this.nav("results")},
  viewAll(){S.origin="";S.destination="";this.nav("results")},
  openDetail(id){S.activeRouteId=id;this.nav("detail")},
  openDetailHome(id){S.activeRouteId=id;S.origin="";S.destination="";this.nav("detail")},
  openBooking(){
    if(!S.currentUser){S.authError="";this.tab("login");return}
    const r=getRoute(S.activeRouteId);const t=nextDepartures(r,getBoarding(),NOW,6);S.selectedTime=t[0];S.passengerCount=1;S.promoCode="";S.promoApplied=null;this.nav("booking")
  },
  openPass(){
    if(!S.currentUser){S.authError="";this.tab("login");return}
    S.selectedPlan=null;this.nav("pass")
  },
  openMultiPass(){
    if(!S.currentUser){S.authError="";this.tab("login");return}
    S.selectedPlan=null;this.nav("pass-multi")
  },
  openTracking(id){
    S.trackRouteId=id;S.trackBusPos=0;
    if(S.trackInterval)clearInterval(S.trackInterval);
    const r=getRoute(id);
    const pts=r?stopsWithCoords(r):[];
    
    // Tính vị trí xe dựa trên thời gian thực và lịch trình
    function updateBusRealTime(){
      if(!r||pts.length<2)return;
      const now=new Date();
      const currentMinutes=now.getHours()*60+now.getMinutes();
      const startMinutes=timeToMinutes(r.hours.start);
      const endMinutes=timeToMinutes(r.hours.end);
      
      // Tính thời gian đã trôi qua từ đầu giờ hoạt động
      const routeDuration=pts[pts.length-1].t; // tổng thời gian toàn tuyến (phút)
      const totalCycleTime=routeDuration+r.frequency; // 1 chu kỳ: thời gian chạy + nghỉ
      
      // Tính xem xe đang ở chu kỳ thứ mấy trong ngày
      const elapsedToday=currentMinutes-startMinutes;
      if(elapsedToday<0||elapsedToday>(endMinutes-startMinutes)){
        // Ngoài giờ hoạt động
        const el=document.getElementById("bus-pos-label");
        if(el)el.textContent="Xe hiện không hoạt động (ngoài giờ)";
        return;
      }
      
      // Vị trí trong chu kỳ hiện tại (tính bằng phút)
      const posInCycle=elapsedToday%totalCycleTime;
      
      // Tìm vị trí giữa các trạm
      let fromIdx=0,toIdx=1;
      if(posInCycle>=routeDuration){
        // Xe đang ở điểm cuối hoặc chuẩn bị cho chuyến mới
        fromIdx=pts.length-1;
        toIdx=0;
        const frac=0;
        moveBusMarker(r,fromIdx,toIdx,frac);
        const el=document.getElementById("bus-pos-label");
        if(el)el.textContent="Xe đang chờ tại: "+pts[fromIdx].name;
        S.trackBusPos=pts.length-1;
        return;
      }
      
      // Tìm cặp trạm dựa vào thời gian
      for(let i=0;i<pts.length-1;i++){
        if(posInCycle>=pts[i].t&&posInCycle<pts[i+1].t){
          fromIdx=i;
          toIdx=i+1;
          break;
        }
      }
      
      // Tính tỷ lệ giữa 2 trạm (0-1)
      const segDuration=pts[toIdx].t-pts[fromIdx].t;
      const segElapsed=posInCycle-pts[fromIdx].t;
      const frac=segDuration>0?Math.min(1,segElapsed/segDuration):0;
      
      moveBusMarker(r,fromIdx,toIdx,frac);
      S.trackBusPos=fromIdx;
      
      const el=document.getElementById("bus-pos-label");
      if(el){
        if(frac<0.5){
          el.textContent="Đã đi: "+pts[fromIdx].name+" → Đang đến: "+pts[toIdx].name;
        }else{
          el.textContent="Gần đến: "+pts[toIdx].name+" (còn ~"+Math.round((1-frac)*segDuration)+" phút)";
        }
      }
    }
    
    updateBusRealTime();
    S.trackInterval=setInterval(updateBusRealTime,5000);
    this.nav("tracking");
  },
  openRating(ticketId){S.ratingTarget=ticketId;S.ratingStars=0;S.ratingComment="";this.nav("rating")},
  setStars(n){S.ratingStars=n;render()},
  submitRating(){
    const t=S.historyTrips.find(h=>h.id===S.ratingTarget);
    if(t)t.rating=S.ratingStars;
    S.ratingTarget=null;this.back();
  },
  toggleFav(id){S.favorites.has(id)?S.favorites.delete(id):S.favorites.add(id);render()},
  setSelectedTime(t){S.selectedTime=t;render()},
  changeQty(d){S.passengerCount=Math.min(5,Math.max(1,S.passengerCount+d));render()},
  setSelectedPlan(id){S.selectedPlan=id;render()},
  setTicketsTab(t){S.ticketsTab=t;render()},
  toggleStudentPrice(){S.useStudentPrice=!S.useStudentPrice;render()},
  async applyPromo(){
    const code=S.promoCode.trim().toUpperCase();
    if(!code){return}
    const r=getRoute(S.activeRouteId);
    const base=r.price*S.passengerCount;
    const after=await applyPromo(base,code);
    if(after===null){alert("Mã giảm giá không hợp lệ hoặc đã hết hạn.");return}
    S.promoApplied={code,discount:null,label:"Mã giảm giá",after};
    render();
  },
  removePromo(){S.promoApplied=null;S.promoCode="";render()},
  async confirmBooking(){
    const r=getRoute(S.activeRouteId);
    const base=r.price*S.passengerCount;
    let total=S.promoApplied?S.promoApplied.after:base;
    // Áp dụng giá sinh viên nếu đã bật
    if(S.useStudentPrice&&isStudentVerified()){
      total=calcStudentPrice(total,"trip");
    }
    const customerName=S.currentUser?S.currentUser.name:"Khách vãng lai";
    const ticket={id:genId(),type:"trip",routeCode:r.code,routeName:r.name,color:r.color,from:getBoarding(),to:getAlighting(),time:S.selectedTime,date:TODAY,count:S.passengerCount,total};
    try{
      const saved=await apiSend("POST","/bookings",{id:ticket.id,routeCode:r.code,customer:customerName,date:TODAY,time:S.selectedTime,count:S.passengerCount,total,status:"confirmed"});
      DEMO_BOOKINGS.unshift(saved);
    }catch(err){console.error(err);}
    S.tickets.unshift(ticket);
    S.historyTrips.unshift({...ticket,rating:0});
    S.confirmedTicketId=ticket.id;S.history=[];S.view="confirm";render();
  },
  async confirmPass(){
    const r=getRoute(S.activeRouteId);
    const plan=PASS_PLANS.find(p=>p.id===S.selectedPlan);
    const expiry=addMonths(NOW,plan.months);
    let total=plan.price;
    // Áp dụng giá sinh viên nếu đã bật
    if(S.useStudentPrice&&isStudentVerified()){
      total=calcStudentPrice(total,"pass");
    }
    const customerName=S.currentUser?S.currentUser.name:"Khách vãng lai";
    const ticket={id:genId(),type:"pass",routeCode:r.code,routeName:r.name,color:r.color,planLabel:plan.label,total,purchaseDate:TODAY,expiry:fmtDate(expiry)};
    try{
      const saved=await apiSend("POST","/passes",{id:ticket.id,routeCode:r.code,customer:customerName,planLabel:plan.label,purchaseDate:TODAY,expiry:fmtDate(expiry),total,status:"active"});
      DEMO_PASSES.unshift(saved);
    }catch(err){console.error(err);}
    S.tickets.unshift(ticket);S.confirmedTicketId=ticket.id;S.history=[];S.view="confirm";render();
  },
  markAllRead(){S.notifications.forEach(n=>n.unread=false);render()},
  openStudentVerify(){S.studentVerifyError="";S.studentVerifySuccess="";this.nav("student-verify")},
  async doStudentVerify(){
    const studentId=document.getElementById("sv-id")?.value.trim();
    const school=document.getElementById("sv-school")?.value.trim();
    if(!studentId||!school){S.studentVerifyError="Vui lòng nhập mã số sinh viên và tên trường.";render();return}
    try{
      const result=await apiSend("POST","/auth/student-verify",{student_id:studentId,school});
      S.currentUser.student_id=result.student_id;
      S.currentUser.school=result.school;
      S.currentUser.student_verified=true;
      S.studentVerifySuccess="Xác minh sinh viên thành công! Bạn đã được cấp quyền mua vé giá sinh viên.";
      S.studentVerifyError="";
      render();
    }catch(err){S.studentVerifyError=err.message;render();}
  },
};

function stopRowHTML(n,t){return`<div class="ad-stop-row-edit"><input class="sni" value="${n||""}" placeholder="Tên trạm" style="flex:1"><input class="sti" type="number" value="${t!=null?t:0}" style="width:80px" placeholder="Phút"><button type="button" class="ad-icon-btn danger" style="flex-shrink:0" onclick="this.closest('.ad-stop-row-edit').remove()">${icon("x",14)}</button></div>`}

/* ======================== CUSTOMER SCREENS ======================== */

function sHome(){
  const same=S.origin&&S.destination&&S.origin===S.destination;
  const nc=unreadCount();
  return`
  <div class="vg-header is-light">
    <div style="display:flex;align-items:center;gap:8px;flex:1">
      <div style="width:32px;height:32px;border-radius:10px;background:var(--primary);display:flex;align-items:center;justify-content:center">${icon("zap",16,"var(--accent)")}</div>
      <span style="font-family:'Sora';font-weight:800;font-size:17px;color:var(--ink)">GoBus</span>
    </div>
    <div style="position:relative">
      <button class="vg-back-btn" onclick="App.tab('notifications')" style="background:var(--surface-2);color:var(--ink)">${icon("bell",17)}</button>
      ${nc>0?`<span class="vg-notif-badge">${nc}</span>`:""}
    </div>
  </div>
  <div class="vg-content screen-enter">
    <div class="vg-hero"><h1>Đi đâu hôm nay?</h1><p>Tìm tuyến buýt điện & buýt thường nhanh chóng.</p></div>
    <div class="vg-search-card">
      <div class="vg-field">
        <div class="vg-field-icon">${icon("map-pin",17)}</div>
        <div style="flex:1"><div class="vg-field-label">Điểm đi</div>
        <select onchange="App.setOrigin(this.value)"><option value="">Chọn điểm đi</option>${STOP_NAMES.map(s=>`<option value="${s}" ${S.origin===s?"selected":""}>${s}</option>`).join("")}</select></div>
      </div>
      <div class="vg-divider-row"><button class="vg-swap-btn" onclick="App.swap()">${icon("arrow-up-down",16)}</button><div class="vg-divider-line"></div></div>
      <div class="vg-field">
        <div class="vg-field-icon">${icon("map-pin",17)}</div>
        <div style="flex:1"><div class="vg-field-label">Điểm đến</div>
        <select onchange="App.setDestination(this.value)"><option value="">Chọn điểm đến</option>${STOP_NAMES.map(s=>`<option value="${s}" ${S.destination===s?"selected":""}>${s}</option>`).join("")}</select></div>
      </div>
      <div class="vg-field" style="border-top:1px solid var(--line);margin-top:4px">
        <div class="vg-field-icon">${icon("calendar",17)}</div>
        <div style="flex:1"><div class="vg-field-label">Ngày đi</div><div style="font-weight:600;font-size:15px;color:var(--ink)">Hôm nay, ${TODAY}</div></div>
      </div>
      ${same?`<div style="font-size:12px;color:var(--danger);padding:4px 4px 0">Điểm đi và điểm đến không thể giống nhau.</div>`:""}
      <button class="vg-btn vg-btn-primary" style="margin-top:14px" ${(!S.origin||!S.destination||same)?"disabled":""} onclick="App.search()">${icon("search",17)} Tìm chuyến</button>
    </div>
    <div>
      <div class="vg-section-title"><span>Tuyến phổ biến</span><button class="vg-btn-link" onclick="App.viewAll()">Xem tất cả</button></div>
      <div class="vg-scroll-row" style="margin-top:10px">
        ${ROUTES.map(r=>`
          <div class="vg-route-chip" onclick="App.openDetailHome('${r.id}')">
            <button class="vg-heart-btn ${S.favorites.has(r.id)?"faved":""}" onclick="event.stopPropagation();App.toggleFav('${r.id}')">${S.favorites.has(r.id)?"❤️":"🤍"}</button>
            <span class="vg-route-code" style="background:${r.color}1A;color:${r.color}">${r.code}</span>
            <div class="vg-route-name">${r.name}</div>
            ${miniLine(r.color)}
            <div class="vg-live-row"><span class="vg-live-dot" style="background:${r.color}"></span>${r.type==="electric"?"Buýt điện":"Buýt thường"} · ${r.frequency} phút/chuyến</div>
          </div>`).join("")}
      </div>
    </div>
  </div>`;
}

const S_FILTER={type:"all",maxPrice:0};
function sResults(){
  let filtered=S.origin&&S.destination?findRoutes(S.origin,S.destination):ROUTES;
  if(S_FILTER.type!=="all")filtered=filtered.filter(r=>r.type===S_FILTER.type);
  if(S_FILTER.maxPrice>0)filtered=filtered.filter(r=>r.price<=S_FILTER.maxPrice);
  const title=S.origin&&S.destination?`${S.origin} → ${S.destination}`:"Tất cả tuyến xe";
  return`
  <div class="vg-header">
    <button class="vg-back-btn" onclick="App.back()">${icon("arrow-left",18)}</button>
    <div><div class="vg-title" style="font-size:16px">${title}</div><div class="vg-subtitle">Hôm nay · ${filtered.length} tuyến phù hợp</div></div>
  </div>
  <div class="vg-content screen-enter">
    <div class="vg-card" style="display:flex;gap:8px;flex-wrap:wrap;padding:12px;margin-bottom:12px">
      <select style="flex:1;min-width:100px;border:1.5px solid var(--line);border-radius:10px;padding:8px 10px;font-size:12px" onchange="S_FILTER.type=this.value;render()">
        <option value="all" ${S_FILTER.type==="all"?"selected":""}>Tất cả loại</option>
        <option value="electric" ${S_FILTER.type==="electric"?"selected":""}>Buýt điện</option>
        <option value="regular" ${S_FILTER.type==="regular"?"selected":""}>Buýt thường</option>
      </select>
      <select style="flex:1;min-width:100px;border:1.5px solid var(--line);border-radius:10px;padding:8px 10px;font-size:12px" onchange="S_FILTER.maxPrice=parseInt(this.value);render()">
        <option value="0" ${S_FILTER.maxPrice===0?"selected":""}>Mọi giá</option>
        <option value="7000" ${S_FILTER.maxPrice===7000?"selected":""}>Dưới 7.000đ</option>
        <option value="10000" ${S_FILTER.maxPrice===10000?"selected":""}>Dưới 10.000đ</option>
        <option value="15000" ${S_FILTER.maxPrice===15000?"selected":""}>Dưới 15.000đ</option>
      </select>
    </div>
    ${filtered.length===0?(()=>{
      const multi=findMultiRoutes(S.origin,S.destination);
      if(multi.length===0)return`<div class="vg-empty"><div class="vg-empty-icon">${icon("bus",26)}</div><div style="font-weight:600;color:var(--ink)">Không tìm thấy tuyến</div><p style="font-size:12px;color:var(--ink-soft);margin:4px 0">Không có tuyến nào đi qua 2 địa điểm này.</p></div>`;
      return`<div class="vg-section-title" style="margin-bottom:8px"><span>🔄 Chuyển tuyến (${multi.length} lựa chọn)</span></div>
      ${multi.map(m=>`<div class="vg-result-card" style="cursor:default;border-left:3px solid ${m.leg1.route.color}">
        <div style="font-size:12px;color:var(--ink-soft);margin-bottom:6px">🚌 ${m.leg1.route.code} → ${icon("arrow-right",12)} ${m.transfer} → ${icon("arrow-right",12)} ${m.leg2.route.code}</div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span class="vg-tag" style="background:${m.leg1.route.color}1A;color:${m.leg1.route.color};font-size:11px">${m.leg1.route.code}</span>
          <span style="font-size:13px;color:var(--ink)">${m.leg1.from} → ${m.leg1.to}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px">
          <span class="vg-tag" style="background:${m.leg2.route.color}1A;color:${m.leg2.route.color};font-size:11px">${m.leg2.route.code}</span>
          <span style="font-size:13px;color:var(--ink)">${m.leg2.from} → ${m.leg2.to}</span>
        </div>
        <div class="vg-result-bottom" style="margin-top:6px">
          <span>⏱ ${m.totalDuration} phút · Trung chuyển tại <b>${m.transfer}</b></span>
          <span class="vg-price">${fmtVND(m.totalPrice)}</span>
        </div>
      </div>`).join("")}`;
    })()
    :filtered.map(r=>{
      const o=S.origin&&r.stops.some(s=>s.name===S.origin)?S.origin:r.stops[0].name;
      const d=S.destination&&r.stops.some(s=>s.name===S.destination)?S.destination:r.stops[r.stops.length-1].name;
      const dur=segDuration(r,o,d);
      const dep=nextDepartures(r,o,NOW,3);
      return`<div class="vg-result-card" onclick="App.openDetail('${r.id}')">
        <button class="vg-heart-btn ${S.favorites.has(r.id)?"faved":""}" onclick="event.stopPropagation();App.toggleFav('${r.id}')">${S.favorites.has(r.id)?"❤️":"🤍"}</button>
        <div class="vg-result-top"><span class="vg-tag" style="background:${r.color}1A;color:${r.color}">${r.code}</span>${icon("chevron-right",18,"var(--ink-soft)")}</div>
        <div class="vg-route-name" style="font-size:14px">${r.name}</div>
        ${miniLine(r.color)}
        <div class="vg-chips-row">${dep.map((t,i)=>`<span class="vg-chip ${i===0?"is-active":""}">${t}</span>`).join("")}</div>
        <div class="vg-result-bottom"><span>${r.type==="electric"?"⚡ Buýt điện":"Buýt thường"}${dur!=null?` · ${dur} phút`:""}</span><span class="vg-price">${fmtVND(r.price)}</span></div>
      </div>`}).join("")}
  </div>`;
}

function sDetail(){
  const r=getRoute(S.activeRouteId);if(!r)return sHome();
  const boarding=getBoarding(),alighting=getAlighting();
  const up=nextDepartures(r,boarding,NOW,4);
  const isFav=S.favorites.has(r.id);
  return`
  <div class="vg-header">
    <button class="vg-back-btn" onclick="App.back()">${icon("arrow-left",18)}</button>
    <div style="flex:1"><div class="vg-title" style="font-size:16px">${r.code} · ${r.name}</div><div class="vg-subtitle">${r.type==="electric"?"Buýt điện":"Buýt thường"} · ${r.stops.length} trạm dừng</div></div>
    <button onclick="App.toggleFav('${r.id}')" style="background:none;border:none;font-size:22px;cursor:pointer">${isFav?"❤️":"🤍"}</button>
  </div>
  <div class="vg-content screen-enter" style="padding-bottom:100px">
    <div id="detail-map" class="vg-map-box"></div>
    <div class="vg-card">
      <div class="vg-section-title" style="margin-bottom:10px">Lộ trình & trạm dừng</div>
      <div class="vg-stop-line">
        <div class="vg-stop-track" style="background:${r.color}33"></div>
        <div class="vg-stop-glow" style="background:${r.color};box-shadow:0 0 12px 3px ${r.color}88;animation:glow-travel 3.6s ease-in-out infinite"></div>
        <style>@keyframes glow-travel{0%{top:8px}100%{top:calc(100% - 22px)}}</style>
        ${r.stops.map((s,i)=>`<div class="vg-stop-row">
          <div class="vg-stop-dot ${(i===0||i===r.stops.length-1)?"is-edge":""}" style="border-color:${r.color};${(i===0||i===r.stops.length-1)?`background:${r.color}`:""}"></div>
          <div><div class="vg-stop-name">${s.name}</div><div class="vg-stop-time">${i===0?"Điểm xuất phát":`+${s.t} phút`}</div></div>
        </div>`).join("")}
      </div>
    </div>
    <div class="vg-info-grid">
      <div class="vg-info-box"><div class="v">${r.frequency}'</div><div class="l">Tần suất</div></div>
      <div class="vg-info-box"><div class="v">${r.hours.start}–${r.hours.end}</div><div class="l">Giờ hoạt động</div></div>
      <div class="vg-info-box"><div class="v">${fmtVND(r.price)}</div><div class="l">Giá vé</div></div>
    </div>
    <div>
      <div class="vg-section-title" style="margin-bottom:10px">Chuyến tiếp theo từ ${boarding}</div>
      <div class="vg-chips-row">${up.map((t,i)=>`<span class="vg-chip ${i===0?"is-active":""}">${t}</span>`).join("")}</div>
    </div>
    <button class="vg-btn vg-btn-ghost" style="gap:8px" onclick="App.openTracking('${r.id}')">${icon("map-pin",16)} Theo dõi xe thời gian thực</button>
    <button class="vg-btn-link" style="align-self:flex-start;padding:4px 0" onclick="App.openPass()">${icon("wallet",15)} Mua thẻ tháng cho tuyến này</button>
    <button class="vg-btn-link" style="align-self:flex-start;padding:4px 0;color:var(--primary)" onclick="App.openMultiPass()">${icon("map",15)} Mua thẻ liên tuyến (tất cả tuyến)</button>
  </div>
  <div class="vg-sticky-bottom">
    <div class="vg-sticky-price"><div class="v">${fmtVND(r.price)}</div><div class="l">mỗi vé · ${boarding} → ${alighting}</div></div>
    <button class="vg-btn vg-btn-primary" onclick="App.openBooking()">Đặt vé</button>
  </div>`;
}

function sBooking(){
  const r=getRoute(S.activeRouteId);if(!r)return sHome();
  const boarding=getBoarding(),alighting=getAlighting();
  const times=nextDepartures(r,boarding,NOW,6);
  const base=r.price*S.passengerCount;
  const studentPrice=isStudentVerified()?calcStudentPrice(base,"trip"):null;
  // Tính giá sau khi áp dụng giảm giá sinh viên (trước khi áp mã giảm)
  const priceAfterStudent=S.useStudentPrice&&isStudentVerified()?studentPrice:base;
  const total=S.promoApplied?S.promoApplied.after:priceAfterStudent;
  return`
  <div class="vg-header">
    <button class="vg-back-btn" onclick="App.back()">${icon("arrow-left",18)}</button>
    <div><div class="vg-title" style="font-size:16px">Đặt vé · ${r.code}</div><div class="vg-subtitle">${boarding} → ${alighting}</div></div>
  </div>
  <div class="vg-content screen-enter">
    <div class="vg-card">
      <div class="vg-section-title" style="margin-bottom:10px">${icon("clock",15)} Chọn giờ khởi hành</div>
      <div class="vg-time-grid">${times.map(t=>`<div class="vg-time-option ${S.selectedTime===t?"is-selected":""}" onclick="App.setSelectedTime('${t}')">${t}</div>`).join("")}</div>
    </div>
    <div class="vg-card">
      <div class="vg-section-title" style="margin-bottom:10px">Số lượng vé</div>
      <div class="vg-stepper">
        <button ${S.passengerCount<=1?"disabled":""} onclick="App.changeQty(-1)">${icon("minus",15)}</button>
        <span class="n">${S.passengerCount}</span>
        <button ${S.passengerCount>=5?"disabled":""} onclick="App.changeQty(1)">${icon("plus",15)}</button>
      </div>
    </div>
    ${isStudentVerified()?`
    <div class="vg-card">
      <div class="vg-section-title" style="margin-bottom:10px">${icon("graduation-cap",15,"var(--primary)")} Giá sinh viên</div>
      <div class="vg-student-toggle">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:40px;height:40px;border-radius:12px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon("graduation-cap",22,"var(--primary)")}</div>
          <div style="flex:1">
            <div style="font-weight:600;font-size:14px;color:var(--ink)">Giá sinh viên (${Math.round(getStudentDiscountRate("trip")*100)}% giảm)</div>
            <div style="font-size:12px;color:var(--ink-soft)">${S.currentUser?.school||""} · ${S.currentUser?.student_id||""}</div>
          </div>
          <div class="vg-toggle" onclick="App.toggleStudentPrice();event.stopPropagation()" style="position:relative;width:44px;height:24px;display:inline-block;cursor:pointer">
            <div style="position:absolute;cursor:pointer;inset:0;background:${S.useStudentPrice?"var(--primary)":"var(--line)"};border-radius:24px;transition:.3s"><div style="position:absolute;height:18px;width:18px;left:${S.useStudentPrice?"23px":"3px"};bottom:3px;background:white;border-radius:50%;transition:.3s"></div></div>
          </div>
        </div>
        ${S.useStudentPrice?`<div style="font-size:12px;color:var(--primary);margin-top:8px;font-weight:600">✓ Đã áp dụng giá sinh viên: ${fmtVND(base)} → ${fmtVND(studentPrice)}</div>`:""}
      </div>
    </div>`:""}
    <div class="vg-card">
      <div class="vg-section-title" style="margin-bottom:10px">${icon("tag",15)} Mã giảm giá</div>
      ${S.promoApplied?`
        <div class="vg-promo-applied">
          <div><div style="font-weight:700;color:var(--primary)">${S.promoApplied.code}</div><div style="font-size:12px;color:var(--ink-soft)">${S.promoApplied.label}</div></div>
          <button class="vg-btn-danger" onclick="App.removePromo()">Bỏ mã</button>
        </div>`:`
        <div class="vg-promo-input">
          <input type="text" placeholder="Nhập mã (VD: GOBUS10)" value="${S.promoCode}" oninput="S.promoCode=this.value" style="flex:1;border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;font-family:'IBM Plex Mono';font-size:14px;text-transform:uppercase">
          <button class="vg-promo-ok" onclick="App.applyPromo()">Áp dụng</button>
        </div>
        <div style="font-size:11px;color:var(--ink-soft);margin-top:6px">Thử: GOBUS10 · BUYT2026 · GOGREEN</div>`}
    </div>
    <div class="vg-card">
      <div class="vg-section-title" style="margin-bottom:6px">Tóm tắt</div>
      <div class="vg-summary-row"><span>Tuyến</span><strong>${r.code} · ${r.name}</strong></div>
      <div class="vg-summary-row"><span>Giờ khởi hành</span><strong>${S.selectedTime}</strong></div>
      <div class="vg-summary-row"><span>Số vé</span><strong>${S.passengerCount}</strong></div>
      <div class="vg-summary-row"><span>Giá gốc</span><strong>${fmtVND(base)}</strong></div>
      ${S.useStudentPrice&&isStudentVerified()?`<div class="vg-summary-row"><span style="color:var(--primary)">Giảm giá sinh viên (-${Math.round(getStudentDiscountRate("trip")*100)}%)</span><strong style="color:var(--primary)">-${fmtVND(base-studentPrice)}</strong></div>`:""}
      ${S.promoApplied?`<div class="vg-summary-row"><span style="color:var(--primary)">${S.promoApplied.label}</span><strong style="color:var(--primary)">-${fmtVND(priceAfterStudent-total)}</strong></div>`:""}
      <div class="vg-summary-total"><span>Tổng tiền</span><span>${fmtVND(total)}</span></div>
    </div>
  </div>
  <div class="vg-sticky-bottom">
    <button class="vg-btn vg-btn-primary" style="width:100%" onclick="App.confirmBooking()">Xác nhận đặt vé · ${fmtVND(total)}</button>
  </div>`;
}

function sPass(){
  const r=getRoute(S.activeRouteId);if(!r)return sHome();
  return`
  <div class="vg-header">
    <button class="vg-back-btn" onclick="App.back()">${icon("arrow-left",18)}</button>
    <div><div class="vg-title" style="font-size:16px">Mua thẻ tháng · ${r.code}</div><div class="vg-subtitle">${r.name}</div></div>
  </div>
  <div class="vg-content screen-enter">
    <p style="font-size:13px;color:var(--ink-soft)">Đi lại không giới hạn trên tuyến ${r.code} hoặc tất cả tuyến với thẻ liên tuyến.</p>
    ${isStudentVerified()?`
    <div class="vg-card" style="margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:40px;height:40px;border-radius:12px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon("graduation-cap",22,"var(--primary)")}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px;color:var(--ink)">Giá sinh viên (${Math.round(getStudentDiscountRate("pass")*100)}% giảm)</div>
          <div style="font-size:12px;color:var(--ink-soft)">${S.currentUser?.school||""} · ${S.currentUser?.student_id||""}</div>
        </div>
        <div class="vg-toggle" onclick="App.toggleStudentPrice();event.stopPropagation()" style="position:relative;width:44px;height:24px;display:inline-block;cursor:pointer">
          <div style="position:absolute;cursor:pointer;inset:0;background:${S.useStudentPrice?"var(--primary)":"var(--line)"};border-radius:24px;transition:.3s"><div style="position:absolute;height:18px;width:18px;left:${S.useStudentPrice?"23px":"3px"};bottom:3px;background:white;border-radius:50%;transition:.3s"></div></div>
        </div>
      </div>
    </div>`:""}
    ${PASS_PLANS.map(p=>{
      const studentPrice=isStudentVerified()?calcStudentPrice(p.price,"pass"):null;
      const displayPrice=S.useStudentPrice&&isStudentVerified()?studentPrice:p.price;
      const originalPrice=S.useStudentPrice&&isStudentVerified()?p.price:null;
      return`<div class="vg-plan-card ${S.selectedPlan===p.id?"is-selected":""}" onclick="App.setSelectedPlan('${p.id}')">
        <div><div style="font-weight:700;color:var(--ink)">${p.label}${p.save?`<span class="vg-plan-badge">${p.save}</span>`:""}</div><div style="font-size:12px;color:var(--ink-soft);margin-top:2px">Không giới hạn số chuyến</div></div>
        <div style="text-align:right">
          <div style="font-family:'IBM Plex Mono';font-weight:700;color:var(--ink)">${fmtVND(displayPrice)}</div>
          ${originalPrice?`<div style="font-size:11px;color:var(--ink-soft);text-decoration:line-through">${fmtVND(originalPrice)}</div>`:""}
        </div>
      </div>`;
    }).join("")}
  </div>
  <div class="vg-sticky-bottom">
    <button class="vg-btn vg-btn-primary" style="width:100%" ${!S.selectedPlan?"disabled":""} onclick="App.confirmPass()">Xác nhận mua</button>
  </div>`;
}

function sPassMulti(){
  // Mục riêng cho thẻ liên tuyến - đi được tất cả tuyến
  return`
  <div class="vg-header">
    <button class="vg-back-btn" onclick="App.back()">${icon("arrow-left",18)}</button>
    <div><div class="vg-title" style="font-size:16px">Thẻ liên tuyến</div><div class="vg-subtitle">Đi tất cả tuyến, không giới hạn</div></div>
  </div>
  <div class="vg-content screen-enter">
    <div class="vg-card" style="background:linear-gradient(135deg,var(--accent-soft),var(--surface-2));border:1.5px solid var(--primary);margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:48px;height:48px;border-radius:14px;background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon("map",24,"var(--accent)")}</div>
        <div>
          <div style="font-weight:700;font-size:15px;color:var(--ink)">Đi được tất cả tuyến bus</div>
          <div style="font-size:12px;color:var(--ink-soft);margin-top:2px">${ROUTES.length} tuyến · Buýt điện & buýt thường</div>
        </div>
      </div>
    </div>
    ${isStudentVerified()?`
    <div class="vg-card" style="margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:40px;height:40px;border-radius:12px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon("graduation-cap",22,"var(--primary)")}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px;color:var(--ink)">Giá sinh viên (${Math.round(getStudentDiscountRate("pass")*100)}% giảm)</div>
          <div style="font-size:12px;color:var(--ink-soft)">${S.currentUser?.school||""} · ${S.currentUser?.student_id||""}</div>
        </div>
        <div class="vg-toggle" onclick="App.toggleStudentPrice();event.stopPropagation()" style="position:relative;width:44px;height:24px;display:inline-block;cursor:pointer">
          <div style="position:absolute;cursor:pointer;inset:0;background:${S.useStudentPrice?"var(--primary)":"var(--line)"};border-radius:24px;transition:.3s"><div style="position:absolute;height:18px;width:18px;left:${S.useStudentPrice?"23px":"3px"};bottom:3px;background:white;border-radius:50%;transition:.3s"></div></div>
        </div>
      </div>
    </div>`:""}
    ${PASS_PLANS.filter(p=>p.type==="multi").map(p=>{
      const studentPrice=isStudentVerified()?calcStudentPrice(p.price,"pass"):null;
      const displayPrice=S.useStudentPrice&&isStudentVerified()?studentPrice:p.price;
      const originalPrice=S.useStudentPrice&&isStudentVerified()?p.price:null;
      return`<div class="vg-plan-card ${S.selectedPlan===p.id?"is-selected":""}" onclick="App.setSelectedPlan('${p.id}')">
        <div><div style="font-weight:700;color:var(--ink)">${p.label.replace(" (Liên tuyến)","")}</div><span class="vg-plan-badge" style="background:var(--primary);color:#fff">Tất cả tuyến</span>${p.save?`<span class="vg-plan-badge">${p.save}</span>`:""}</div>
        <div style="text-align:right">
          <div style="font-family:'IBM Plex Mono';font-weight:700;color:var(--ink)">${fmtVND(displayPrice)}</div>
          ${originalPrice?`<div style="font-size:11px;color:var(--ink-soft);text-decoration:line-through">${fmtVND(originalPrice)}</div>`:""}
        </div>
      </div>`;
    }).join("")}
  </div>
  <div class="vg-sticky-bottom">
    <button class="vg-btn vg-btn-primary" style="width:100%" ${!S.selectedPlan?"disabled":""} onclick="App.confirmPass()">Xác nhận mua thẻ liên tuyến</button>
  </div>`;
}

function sConfirm(){
  const t=S.tickets.find(k=>k.id===S.confirmedTicketId);if(!t)return sHome();
  const isPass=t.type==="pass";
  return`
  <div class="vg-content screen-enter" style="padding-top:28px">
    <button class="vg-back-btn" style="align-self:flex-end;background:var(--surface-2);color:var(--ink)" onclick="App.tab('home')">${icon("x",18)}</button>
    <div class="vg-success-icon">${icon("check-circle-2",34)}</div>
    <div style="text-align:center">
      <div style="font-family:'Sora';font-weight:700;font-size:18px;color:var(--ink)">${isPass?"Mua thẻ tháng thành công":"Đặt vé thành công"}</div>
      <p style="font-size:13px;color:var(--ink-soft);margin-top:4px">Mã vé đã lưu vào "Vé của tôi".</p>
    </div>
    <div class="vg-ticket-card">
      <div class="vg-ticket-top" style="background:${t.color}">
        <div style="font-size:12px;opacity:.85">${isPass?"Thẻ tháng":"Vé lượt"}</div>
        <div style="font-family:'Sora';font-weight:700;font-size:17px">${t.routeCode} · ${t.routeName}</div>
      </div>
      <div class="vg-ticket-mid">
        ${isPass?`<div class="vg-summary-row"><span>Loại thẻ</span><strong>${t.planLabel}</strong></div><div class="vg-summary-row"><span>Ngày mua</span><strong>${t.purchaseDate}</strong></div><div class="vg-summary-row"><span>Hết hạn</span><strong>${t.expiry}</strong></div>`
        :`<div class="vg-summary-row"><span>Từ</span><strong>${t.from}</strong></div><div class="vg-summary-row"><span>Đến</span><strong>${t.to}</strong></div><div class="vg-summary-row"><span>Giờ khởi hành</span><strong>${t.time} · ${t.date}</strong></div><div class="vg-summary-row"><span>Số vé</span><strong>${t.count}</strong></div>`}
        <div class="vg-summary-total"><span>Tổng tiền</span><span>${fmtVND(t.total)}</span></div>
      </div>
      <div class="vg-perforation"></div>
      <div class="vg-qr-wrap"><div class="vg-qr-grid">${qrHTML(t.id)}</div><div><div style="font-size:11px;color:var(--ink-soft)">Mã vé</div><div style="font-family:'IBM Plex Mono';font-weight:700;font-size:15px">${t.id}</div><div style="font-size:11px;color:var(--ink-soft);margin-top:4px">Quét tại cửa xe</div></div></div>
    </div>
    <div style="display:flex;gap:10px">
      <button class="vg-btn vg-btn-ghost" style="flex:1" onclick="App.tab('home')">Về trang chủ</button>
      <button class="vg-btn vg-btn-dark" style="flex:1" onclick="App.tab('tickets')">Xem vé của tôi</button>
    </div>
  </div>`;
}

function sTickets(){
  const trip=S.tickets.filter(t=>t.type==="trip");
  const pass=S.tickets.filter(t=>t.type==="pass");
  const list=S.ticketsTab==="trip"?trip:pass;
  return`
  <div class="vg-header is-light">
    <div><div class="vg-title">Vé của tôi</div><div class="vg-subtitle">${S.tickets.length} vé đã lưu</div></div>
  </div>
  <div class="vg-content screen-enter">
    <div class="vg-tabs">
      <button class="vg-tab ${S.ticketsTab==="trip"?"is-active":""}" onclick="App.setTicketsTab('trip')">Vé lượt (${trip.length})</button>
      <button class="vg-tab ${S.ticketsTab==="pass"?"is-active":""}" onclick="App.setTicketsTab('pass')">Thẻ tháng (${pass.length})</button>
    </div>
    ${list.length===0?`<div class="vg-empty"><div class="vg-empty-icon">${icon("ticket",26)}</div><div style="font-weight:600;color:var(--ink)">Chưa có vé nào</div><button class="vg-btn vg-btn-primary" onclick="App.tab('home')">Tìm chuyến ngay</button></div>`
    :list.map(t=>`<div class="vg-result-card" style="cursor:default">
      <div class="vg-result-top"><span class="vg-tag" style="background:${t.color}1A;color:${t.color}">${t.routeCode}</span><span style="font-family:'IBM Plex Mono';font-size:11px;color:var(--ink-soft)">${t.id}</span></div>
      <div class="vg-route-name" style="font-size:14px">${t.routeName}</div>
      ${t.type==="trip"?`<div class="vg-result-bottom"><span>${t.from} → ${t.to} · ${t.time}</span><span class="vg-price">${fmtVND(t.total)}</span></div>`
      :`<div class="vg-result-bottom"><span>${t.planLabel} · hết hạn ${t.expiry}</span><span class="vg-price">${fmtVND(t.total)}</span></div>`}
    </div>`).join("")}
  </div>`;
}

function sNotifications(){
  const nc=unreadCount();
  return`
  <div class="vg-header is-light">
    <button class="vg-back-btn" onclick="App.back()">${icon("arrow-left",18)}</button>
    <div style="flex:1"><div class="vg-title">Thông báo</div><div class="vg-subtitle">${nc} chưa đọc</div></div>
    ${nc>0?`<button class="vg-btn-link" onclick="App.markAllRead()">Đọc tất cả</button>`:""}
  </div>
  <div class="vg-content screen-enter">
    ${S.notifications.map(n=>`
    <div class="vg-notif-item ${n.unread?"unread":""}">
      <div class="vg-notif-icon" style="background:${n.color}1A">${icon(n.icon,20,n.color)}</div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:14px;color:var(--ink)">${n.title}</div>
        <div style="font-size:12px;color:var(--ink-soft);margin-top:2px">${n.sub}</div>
        <div style="font-size:11px;color:var(--ink-soft);margin-top:4px">${n.time}</div>
      </div>
      ${n.unread?`<div style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex-shrink:0;margin-top:4px"></div>`:""}
    </div>`).join("")}
  </div>`;
}

function sTracking(){
  const r=getRoute(S.trackRouteId||S.activeRouteId);
  if(!r)return sHome();
  const busAt=r.stops[Math.min(S.trackBusPos,r.stops.length-1)];
  return`
  <div class="vg-header">
    <button class="vg-back-btn" onclick="App.back()">${icon("arrow-left",18)}</button>
    <div><div class="vg-title" style="font-size:16px">Theo dõi xe · ${r.code}</div><div class="vg-subtitle">Thời gian thực</div></div>
  </div>
  <div class="vg-content screen-enter">
    <div id="tracking-map" class="vg-map-box tall"></div>
    <div class="vg-track-card">
      <div class="vg-track-header" style="background:${r.color}">
        <div>
          <div style="font-size:12px;opacity:.85">Tuyến ${r.code}</div>
          <div style="font-family:'Sora';font-weight:700;font-size:15px">${r.name}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;opacity:.85">Thời gian đến trạm bạn</div>
          <div style="font-family:'IBM Plex Mono';font-weight:700;font-size:20px">~3 phút</div>
        </div>
      </div>
      <div class="vg-track-body">
        <div id="bus-pos-label" style="font-size:13px;color:var(--ink-soft);margin-bottom:14px;font-weight:500">Xe đang đến: ${busAt?.name||""}</div>
        <div class="vg-stop-line">
          <div class="vg-stop-track" style="background:${r.color}33"></div>
          ${r.stops.map((s,i)=>{
            const isBus=i===Math.min(S.trackBusPos,r.stops.length-1);
            return`<div class="vg-stop-row">
              <div class="vg-stop-dot ${(i===0||i===r.stops.length-1)?"is-edge":""}" style="border-color:${r.color};${(i===0||i===r.stops.length-1)?`background:${r.color}`:""}"></div>
              <div style="flex:1">
                <div class="vg-stop-name">${s.name} ${isBus?`<span style="font-size:11px;background:${r.color}1A;color:${r.color};border-radius:6px;padding:2px 7px;font-weight:700">🚌 Xe đang ở đây</span>`:""}</div>
                <div class="vg-stop-time">${i===0?"Điểm xuất phát":`+${s.t} phút`}</div>
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>
    <div class="vg-card" style="display:flex;align-items:center;gap:12px">
      <div style="width:40px;height:40px;border-radius:12px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center">${icon("bell",20,"var(--primary)")}</div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:14px;color:var(--ink)">Bật thông báo chuyến</div>
        <div style="font-size:12px;color:var(--ink-soft)">Nhắc trước 5 phút khi xe đến trạm của bạn</div>
      </div>
      <label style="position:relative;width:44px;height:24px;display:inline-block">
        <input type="checkbox" checked style="opacity:0;width:0;height:0">
        <span style="position:absolute;cursor:pointer;inset:0;background:var(--accent);border-radius:24px;transition:.3s"><span style="position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:white;border-radius:50%;transition:.3s;transform:translateX(20px)"></span></span>
      </label>
    </div>
    <div class="vg-card">
      <div style="font-weight:600;font-size:14px;color:var(--ink);margin-bottom:8px">Thông tin chuyến tiếp theo</div>
      <div class="vg-chips-row">${nextDepartures(r,r.stops[0].name,NOW,4).map((t,i)=>`<span class="vg-chip ${i===0?"is-active":""}">${t}</span>`).join("")}</div>
    </div>
  </div>`;
}

function sFavorites(){
  const favs=ROUTES.filter(r=>S.favorites.has(r.id));
  return`
  <div class="vg-header is-light">
    <div><div class="vg-title">Tuyến yêu thích</div><div class="vg-subtitle">${favs.length} tuyến đã lưu</div></div>
  </div>
  <div class="vg-content screen-enter">
    ${favs.length===0?`<div class="vg-empty"><div class="vg-empty-icon">🤍</div><div style="font-weight:600;color:var(--ink)">Chưa lưu tuyến nào</div><p style="font-size:13px">Nhấn ❤️ trên thẻ tuyến để lưu vào đây.</p><button class="vg-btn vg-btn-primary" onclick="App.tab('home')">Tìm tuyến ngay</button></div>`
    :favs.map(r=>`
    <div class="vg-result-card" onclick="App.openDetailHome('${r.id}')">
      <button class="vg-heart-btn faved" onclick="event.stopPropagation();App.toggleFav('${r.id}')">❤️</button>
      <div class="vg-result-top"><span class="vg-tag" style="background:${r.color}1A;color:${r.color}">${r.code}</span>${icon("chevron-right",18,"var(--ink-soft)")}</div>
      <div class="vg-route-name" style="font-size:14px">${r.name}</div>
      ${miniLine(r.color)}
      <div class="vg-chips-row">${nextDepartures(r,r.stops[0].name,NOW,3).map((t,i)=>`<span class="vg-chip ${i===0?"is-active":""}">${t}</span>`).join("")}</div>
      <div class="vg-result-bottom"><span>${r.type==="electric"?"⚡ Buýt điện":"Buýt thường"} · ${r.frequency} phút/chuyến</span><span class="vg-price">${fmtVND(r.price)}</span></div>
    </div>`).join("")}
  </div>`;
}

function sHistory(){
  return`
  <div class="vg-header is-light">
    <div><div class="vg-title">Lịch sử hành trình</div><div class="vg-subtitle">${S.historyTrips.length} chuyến đã đi</div></div>
  </div>
  <div class="vg-content screen-enter">
    ${S.historyTrips.length===0?`<div class="vg-empty"><div class="vg-empty-icon">${icon("history",26)}</div><div style="font-weight:600;color:var(--ink)">Chưa có chuyến nào</div></div>`
    :S.historyTrips.map(h=>`
    <div class="vg-history-item">
      <div class="vg-history-icon" style="background:${h.color}1A">${icon("bus",18,h.color)}</div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span class="vg-tag" style="background:${h.color}1A;color:${h.color}">${h.routeCode}</span>
          <span style="font-size:12px;color:var(--ink-soft)">${h.date}</span>
        </div>
        <div style="font-weight:600;font-size:13px;color:var(--ink);margin-top:4px">${h.from} → ${h.to}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
          <span style="font-size:12px;color:var(--ink-soft)">${h.time} · ${fmtVND(h.total)}</span>
          ${h.rating>0
            ?`<span style="color:#F59E0B;font-size:13px">${"★".repeat(h.rating)}${"☆".repeat(5-h.rating)}</span>`
            :`<button class="vg-btn-link" style="padding:0;font-size:12px" onclick="App.openRating('${h.id}')">Đánh giá</button>`}
        </div>
      </div>
    </div>`).join("")}
  </div>`;
}

function sRating(){
  const h=S.historyTrips.find(x=>x.id===S.ratingTarget);
  if(!h)return sHome();
  return`
  <div class="vg-header is-light">
    <button class="vg-back-btn" onclick="App.back()">${icon("arrow-left",18)}</button>
    <div><div class="vg-title" style="font-size:16px">Đánh giá chuyến đi</div><div class="vg-subtitle">${h.routeCode} · ${h.from} → ${h.to}</div></div>
  </div>
  <div class="vg-content screen-enter" style="text-align:center">
    <div style="width:64px;height:64px;border-radius:50%;background:var(--surface-2);display:flex;align-items:center;justify-content:center;margin:0 auto">${icon("bus",28,"var(--primary)")}</div>
    <div style="font-family:'Sora';font-weight:700;font-size:16px;color:var(--ink)">Chuyến đi của bạn thế nào?</div>
    <p style="font-size:13px;color:var(--ink-soft);margin:0">${h.date} · ${h.time}</p>
    <div class="vg-stars">
      ${[1,2,3,4,5].map(n=>`<span class="vg-star ${S.ratingStars>=n?"lit":""}" onclick="App.setStars(${n})">★</span>`).join("")}
    </div>
    <div style="font-size:14px;color:var(--ink-soft);margin-top:-4px">${["","Rất tệ","Tệ","Bình thường","Tốt","Xuất sắc"][S.ratingStars]||"Chọn số sao"}</div>
    <textarea placeholder="Chia sẻ thêm cảm nhận của bạn... (tuỳ chọn)" style="width:100%;border:1.5px solid var(--line);border-radius:14px;padding:14px;font-family:'Inter';font-size:14px;resize:none;height:100px;margin-top:4px;box-sizing:border-box" oninput="S.ratingComment=this.value"></textarea>
    <button class="vg-btn vg-btn-primary" style="width:100%" ${!S.ratingStars?"disabled":""} onclick="App.submitRating()">Gửi đánh giá</button>
    <button class="vg-btn-link" onclick="App.back()">Bỏ qua</button>
  </div>`;
}

function sOther(){
  const nc=unreadCount();
  return`
  <div class="vg-header is-light">
    <div style="display:flex;align-items:center;gap:8px;flex:1">
      <div style="width:32px;height:32px;border-radius:10px;background:var(--primary);display:flex;align-items:center;justify-content:center">${icon("zap",16,"var(--accent)")}</div>
      <span style="font-family:'Sora';font-weight:800;font-size:17px;color:var(--ink)">GoBus</span>
    </div>
  </div>
  <div class="vg-content screen-enter">
    <div style="display:flex;flex-direction:column;gap:10px">
      ${S.currentUser?`
      <div class="vg-result-card" style="flex-direction:row;align-items:center;gap:14px">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-weight:800">${icon("user",20,"var(--accent)")}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:15px;color:var(--ink)">${S.currentUser.name}</div>
          <div style="font-size:12px;color:var(--ink-soft);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${S.currentUser.email}</div>
          ${isStudentVerified()?`<div style="font-size:11px;color:var(--primary);margin-top:2px">🎓 Đã xác minh sinh viên</div>`:""}
        </div>
        <button class="vg-btn vg-btn-ghost" style="padding:8px 14px;font-size:13px" onclick="App.doLogout()">Đăng xuất</button>
      </div>`:`
      <div class="vg-result-card" style="cursor:pointer;flex-direction:row;align-items:center;gap:14px" onclick="App.tab('login')">
        <div style="width:44px;height:44px;border-radius:14px;background:#3C7CD91A;display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon("log-in",22,"#3C7CD9")}</div>
        <div style="flex:1"><div style="font-weight:700;font-size:15px;color:var(--ink)">Đăng nhập / Đăng ký</div><div style="font-size:12px;color:var(--ink-soft);margin-top:2px">Lưu vé và thẻ tháng vào tài khoản của bạn</div></div>
        ${icon("chevron-right",18,"var(--ink-soft)")}
      </div>`}
      ${[
        {icon:"heart",label:"Tuyến yêu thích",sub:`${S.favorites.size} tuyến đã lưu`,view:"favorites",color:"#E0524A"},
        {icon:"history",label:"Lịch sử hành trình",sub:`${S.historyTrips.length} chuyến đã đi`,view:"history",color:"#3C7CD9"},
        {icon:"bell",label:"Thông báo",sub:`${nc} thông báo chưa đọc`,view:"notifications",color:"#F59E0B"},
      ].map(item=>`
      <div class="vg-result-card" style="cursor:pointer;flex-direction:row;align-items:center;gap:14px" onclick="App.tab('${item.view}')">
        <div style="width:44px;height:44px;border-radius:14px;background:${item.color}1A;display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon(item.icon,22,item.color)}</div>
        <div style="flex:1"><div style="font-weight:700;font-size:15px;color:var(--ink)">${item.label}</div><div style="font-size:12px;color:var(--ink-soft);margin-top:2px">${item.sub}</div></div>
        ${icon("chevron-right",18,"var(--ink-soft)")}
      </div>`).join("")}
      ${S.currentUser?`
      <div class="vg-result-card" style="cursor:pointer;flex-direction:row;align-items:center;gap:14px" onclick="App.tab('student-verify')">
        <div style="width:44px;height:44px;border-radius:14px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon("graduation-cap",22,"var(--primary)")}</div>
        <div style="flex:1"><div style="font-weight:700;font-size:15px;color:var(--ink)">${isStudentVerified()?"Thông tin sinh viên":"Xác minh sinh viên"}</div><div style="font-size:12px;color:var(--ink-soft);margin-top:2px">${isStudentVerified()?"Giảm "+Math.round(getStudentDiscountRate("trip")*100)+"% vé lượt & "+Math.round(getStudentDiscountRate("pass")*100)+"% thẻ tháng":"Nhập MSSV để nhận ưu đãi"}</div></div>
        ${icon("chevron-right",18,"var(--ink-soft)")}
      </div>`:""}
    </div>
    <div style="margin-top:4px;padding:16px;background:var(--surface-2);border-radius:16px;text-align:center">
      <a href="admin.html" style="font-size:12px;color:var(--ink-soft);text-decoration:none">Dành cho quản trị viên →</a>
    </div>
  </div>`;
}

/* ======================== ĐĂNG NHẬP / ĐĂNG KÝ (khách hàng) ======================== */
function sLogin(){
  return`
  <div class="vg-header is-light">
    <button class="vg-back-btn" onclick="App.tab('other')">${icon("arrow-left",20)}</button>
    <span style="font-family:'Sora';font-weight:800;font-size:17px;color:var(--ink)">Đăng nhập</span>
  </div>
  <div class="vg-content screen-enter">
    <div class="vg-card" style="display:flex;flex-direction:column;gap:14px">
      ${S.authError?`<div class="auth-error">${S.authError}</div>`:""}
      <div class="ad-form-row"><label>Email</label><input id="li-email" type="email" placeholder="ban@email.com" onkeydown="if(event.key==='Enter')App.doLogin()"></div>
      <div class="ad-form-row"><label>Mật khẩu</label><input id="li-password" type="password" placeholder="Nhập mật khẩu" onkeydown="if(event.key==='Enter')App.doLogin()"></div>
      <button class="vg-btn vg-btn-primary" style="width:100%" onclick="App.doLogin()">Đăng nhập</button>
      <div style="text-align:center;font-size:13px;color:var(--ink-soft)">Chưa có tài khoản? <a href="#" onclick="event.preventDefault();App.clearAuthErrorAndGo('register')" style="color:var(--primary);font-weight:700;text-decoration:none">Đăng ký ngay</a></div>
    </div>
  </div>`;
}

function sRegister(){
  return`
  <div class="vg-header is-light">
    <button class="vg-back-btn" onclick="App.tab('other')">${icon("arrow-left",20)}</button>
    <span style="font-family:'Sora';font-weight:800;font-size:17px;color:var(--ink)">Đăng ký</span>
  </div>
  <div class="vg-content screen-enter">
    <div class="vg-card" style="display:flex;flex-direction:column;gap:14px">
      ${S.authError?`<div class="auth-error">${S.authError}</div>`:""}
      <div class="ad-form-row"><label>Họ và tên</label><input id="rg-name" placeholder="Nguyễn Văn A"></div>
      <div class="ad-form-row"><label>Email</label><input id="rg-email" type="email" placeholder="ban@email.com"></div>
      <div class="ad-form-row"><label>Số điện thoại</label><input id="rg-phone" placeholder="09xxxxxxxx"></div>
      <div class="ad-form-row"><label>Mật khẩu</label><input id="rg-password" type="password" placeholder="Tối thiểu 6 ký tự" onkeydown="if(event.key==='Enter')App.doRegister()"></div>
      <button class="vg-btn vg-btn-primary" style="width:100%" onclick="App.doRegister()">Tạo tài khoản</button>
      <div style="text-align:center;font-size:13px;color:var(--ink-soft)">Đã có tài khoản? <a href="#" onclick="event.preventDefault();App.clearAuthErrorAndGo('login')" style="color:var(--primary);font-weight:700;text-decoration:none">Đăng nhập</a></div>
    </div>
  </div>`;
}

/* ======================== XÁC MINH SINH VIÊN ======================== */
function sStudentVerify(){
  const verified=isStudentVerified();
  return`
  <div class="vg-header is-light">
    <button class="vg-back-btn" onclick="App.back()">${icon("arrow-left",20)}</button>
    <span style="font-family:'Sora';font-weight:800;font-size:17px;color:var(--ink)">${verified?"Thông tin sinh viên":"Xác minh sinh viên"}</span>
  </div>
  <div class="vg-content screen-enter">
    ${verified?`
    <div class="vg-card" style="text-align:center;padding:24px">
      <div style="width:64px;height:64px;border-radius:50%;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;margin:0 auto">${icon("graduation-cap",28,"var(--primary)")}</div>
      <div style="font-weight:700;font-size:17px;color:var(--ink);margin-top:12px">Đã xác minh sinh viên</div>
      <div style="margin-top:12px;text-align:left;background:var(--surface-2);border-radius:12px;padding:14px">
        <div class="vg-summary-row"><span>Mã số sinh viên</span><strong>${S.currentUser.student_id||""}</strong></div>
        <div class="vg-summary-row"><span>Trường học</span><strong>${S.currentUser.school||""}</strong></div>
      </div>
      <div style="margin-top:14px;font-size:13px;color:var(--ink-soft)">
        🎉 Bạn được giảm <b>${Math.round(getStudentDiscountRate("trip")*100)}%</b> giá vé lượt và <b>${Math.round(getStudentDiscountRate("pass")*100)}%</b> giá thẻ tháng!
      </div>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
        <button class="vg-btn vg-btn-primary" onclick="App.tab('home')">${icon("search",15)} Tìm chuyến ngay</button>
      </div>
    </div>`:`
    <div class="vg-card" style="text-align:center;padding:24px">
      <div style="width:64px;height:64px;border-radius:50%;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;margin:0 auto">${icon("graduation-cap",28,"var(--primary)")}</div>
      <div style="font-family:'Sora';font-weight:700;font-size:17px;color:var(--ink);margin-top:12px">Bạn là sinh viên?</div>
      <p style="font-size:13px;color:var(--ink-soft);margin:6px 0 0">Nhập thông tin để nhận ưu đãi <b>giảm ${Math.round(getStudentDiscountRate("trip")*100)}% vé lượt</b> và <b>giảm ${Math.round(getStudentDiscountRate("pass")*100)}% thẻ tháng</b>!</p>
    </div>
    <div class="vg-card" style="display:flex;flex-direction:column;gap:14px">
      ${S.studentVerifyError?`<div class="auth-error">${S.studentVerifyError}</div>`:""}
      ${S.studentVerifySuccess?`<div class="auth-success">${S.studentVerifySuccess}</div>`:""}
      <div class="ad-form-row"><label>Mã số sinh viên (MSSV)</label><input id="sv-id" placeholder="VD: 2024123456" onkeydown="if(event.key==='Enter')App.doStudentVerify()"></div>
      <div class="ad-form-row"><label>Tên trường / Đại học</label><input id="sv-school" placeholder="VD: Đại học Bách Khoa Hà Nội" onkeydown="if(event.key==='Enter')App.doStudentVerify()"></div>
      <button class="vg-btn vg-btn-primary" style="width:100%" onclick="App.doStudentVerify()">Xác minh ngay</button>
    </div>
    <div style="font-size:11px;color:var(--ink-soft);text-align:center;padding:8px">
      Thông tin của bạn sẽ được bảo mật. Chỉ sử dụng cho mục đích xác minh sinh viên.
    </div>`}
  </div>`;
}

/* ======================== ĐĂNG NHẬP QUẢN TRỊ VIÊN ======================== */
function renderAdminLogin(){
  document.getElementById("root").innerHTML=sAdminLogin();
  if(window.lucide)lucide.createIcons();
}

function sAdminLogin(){
  return`
  <div class="ad-login-wrap">
    <div class="ad-login-card">
      <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:20px">
        <div style="width:36px;height:36px;border-radius:10px;background:var(--primary);display:flex;align-items:center;justify-content:center">${icon("zap",18,"var(--accent)")}</div>
        <span style="font-family:'Sora';font-weight:800;font-size:19px;color:var(--ink)">GoBus Admin</span>
      </div>
      ${S.authError?`<div class="auth-error">${S.authError}</div>`:""}
      <div class="ad-form-row"><label>Email quản trị viên</label><input id="ad-email" type="email" placeholder="admin@gobus.vn" onkeydown="if(event.key==='Enter')AdminApp.doLogin()"></div>
      <div class="ad-form-row"><label>Mật khẩu</label><input id="ad-password" type="password" placeholder="Nhập mật khẩu" onkeydown="if(event.key==='Enter')AdminApp.doLogin()"></div>
      <button class="vg-btn vg-btn-primary" style="width:100%" onclick="AdminApp.doLogin()">Đăng nhập</button>
      <div style="text-align:center;font-size:12px;color:var(--ink-soft);margin-top:16px"><a href="index.html" style="color:inherit;text-decoration:none">← Về trang khách hàng</a></div>
    </div>
  </div>`;
}

/* ======================== ADMIN SCREENS ======================== */

function adSidebar(active){
  return`
  <div class="ad-sidebar">
    <div class="ad-logo">
      <div style="width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center">${icon("zap",16,"var(--accent)")}</div>
      <span style="font-family:'Sora';font-weight:800;font-size:16px">GoBus Admin</span>
    </div>
    ${[["overview","layout-dashboard","Tổng quan"],["routes","bus","Tuyến xe"],["bookings","ticket","Vé đã đặt"],["passes","wallet","Thẻ tháng"],["drivers","users","Tài xế & Xe"],["promos","tag","Khuyến mãi"],["settings","settings","Cài đặt"]].map(([sec,ic,lbl])=>`
    <button class="ad-nav-item ${active===sec?"is-active":""}" onclick="AdminApp.sec('${sec}')">${icon(ic,16)} ${lbl}</button>`).join("")}
    <div class="ad-sidebar-footer">
      ${S.currentAdmin?`<div style="font-size:12px;color:rgba(255,255,255,.6);padding:0 4px 8px">Đăng nhập: ${S.currentAdmin.name}</div>`:""}
      <a href="index.html">${icon("arrow-left",14)} Về trang khách hàng</a>
      <a href="#" onclick="event.preventDefault();AdminApp.doLogout()">${icon("log-out",14)} Đăng xuất</a>
    </div>
  </div>`;
}

function adTopbar(title,sub){return`<div class="ad-topbar"><div><h1>${title}</h1><p>${sub}</p></div></div>`}

/* Revenue chart data */
const REVENUE_DATA={
  day:["T2","T3","T4","T5","T6","T7","CN"].map((l,i)=>({l,v:Math.round((80000+Math.random()*60000)*(i===5||i===6?1.5:1))})),
  week:["Tuần 1","Tuần 2","Tuần 3","Tuần 4"].map(l=>({l,v:Math.round(350000+Math.random()*200000)})),
  month:["T1","T2","T3","T4","T5","T6"].map(l=>({l,v:Math.round(1200000+Math.random()*800000)})),
};

function adOverview(){
  const data=REVENUE_DATA[S.adminPeriod];
  const maxV=Math.max(...data.map(d=>d.v));
  const totalRev=DEMO_BOOKINGS.reduce((s,b)=>s+b.total,0)+DEMO_PASSES.reduce((s,p)=>s+p.total,0);
  const elec=ROUTES.filter(r=>r.type==="electric").length;
  const reg=ROUTES.length-elec;
  const pct=ROUTES.length?Math.round(elec/ROUTES.length*100):0;
  return`
  <div class="ad-stats-grid">
    ${[
      {l:"Tổng số tuyến",v:ROUTES.length,t:"↑ 0 tuần này",up:true},
      {l:"Vé đã bán (demo)",v:DEMO_BOOKINGS.reduce((s,b)=>s+b.count,0),t:"↑ 12% so với tuần trước",up:true},
      {l:"Doanh thu (demo)",v:fmtVND(totalRev),t:"↑ 8% so với tuần trước",up:true},
      {l:"Thẻ đang hoạt động",v:DEMO_PASSES.filter(p=>p.status==="active").length,t:"↓ 1 so với tuần trước",up:false},
    ].map(s=>`<div class="ad-stat-card"><div class="label">${s.l}</div><div class="value">${s.v}</div><div class="trend ${s.up?"up":"down"}">${s.t}</div></div>`).join("")}
  </div>
  <div class="ad-charts-row">
    <div class="ad-panel">
      <div class="ad-panel-title">
        <span>Doanh thu theo thời gian</span>
        <div class="ad-period-tabs">
          ${[["day","Ngày"],["week","Tuần"],["month","Tháng"]].map(([k,l])=>`<button class="ad-period-tab ${S.adminPeriod===k?"is-active":""}" onclick="AdminApp.period('${k}')">${l}</button>`).join("")}
        </div>
      </div>
      <div class="ad-bar-chart">
        ${data.map(d=>`
        <div class="ad-bar-col">
          <div class="ad-bar-value">${fmtVND(d.v)}</div>
          <div class="ad-bar" style="height:${Math.max(8,Math.round(d.v/maxV*130))}px;background:linear-gradient(to top,var(--primary),#1FAE7C)"></div>
          <div class="ad-bar-label">${d.l}</div>
        </div>`).join("")}
      </div>
    </div>
    <div class="ad-panel">
      <div class="ad-panel-title">Cơ cấu loại xe</div>
      <div class="ad-donut" style="background:conic-gradient(#1FAE7C 0% ${pct}%, #3C7CD9 ${pct}% 100%)">
        <div class="ad-donut-center"><div style="font-family:'IBM Plex Mono';font-weight:700;font-size:18px;color:var(--ink)">${pct}%</div><div style="font-size:10px;color:var(--ink-soft)">điện</div></div>
      </div>
      <div class="ad-legend">
        <div class="ad-legend-item"><span class="ad-legend-dot" style="background:#1FAE7C"></span>Buýt điện · ${elec} tuyến</div>
        <div class="ad-legend-item"><span class="ad-legend-dot" style="background:#3C7CD9"></span>Buýt thường · ${reg} tuyến</div>
      </div>
    </div>
  </div>
  <div class="ad-panel">
    <div class="ad-panel-title">Hoạt động gần đây</div>
    <div class="ad-table-wrap"><table class="ad-table">
      <thead><tr><th>Mã vé</th><th>Tuyến</th><th>Khách hàng</th><th>Thời gian</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
      <tbody>${DEMO_BOOKINGS.slice(0,5).map(b=>`<tr><td style="font-family:'IBM Plex Mono'">${b.id}</td><td>${b.routeCode}</td><td>${b.customer}</td><td>${b.date} · ${b.time}</td><td>${fmtVND(b.total)}</td><td>${bBadge(b.status)}</td></tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}

function bBadge(s){const m={confirmed:["success","Đã xác nhận"],used:["muted","Đã sử dụng"],cancelled:["danger","Đã hủy"]};const[c,l]=m[s]||["muted",s];return`<span class="ad-badge ${c}">${l}</span>`}
function pBadge(s){const m={active:["success","Đang hoạt động"],expired:["muted","Hết hạn"]};const[c,l]=m[s]||["muted",s];return`<span class="ad-badge ${c}">${l}</span>`}
function dBadge(s){const m={on_duty:["success","Đang trực"],off_duty:["muted","Nghỉ"],maintenance:["warn","Bảo dưỡng"]};const[c,l]=m[s]||["muted",s];return`<span class="ad-badge ${c}">${l}</span>`}

function adRoutes(){
  const editing=S.adminModal?.id?getRoute(S.adminModal.id):null;
  const modal=S.adminModal?`
  <div class="ad-modal-overlay" onmousedown="if(event.target===this)AdminApp.closeModal()">
    <div class="ad-modal">
      <h2>${editing?"Sửa tuyến xe":"Thêm tuyến mới"}</h2>
      <p style="font-size:12px;color:var(--ink-soft);margin:0 0 16px">Điền thông tin và danh sách trạm dừng.</p>
      <div id="formError" style="font-size:12px;color:var(--danger);margin-bottom:8px"></div>
      <div class="ad-form-grid-2">
        <div class="ad-form-row"><label>Mã tuyến</label><input id="f-code" value="${editing?.code||""}" placeholder="VD: E10"></div>
        <div class="ad-form-row"><label>Loại xe</label><select id="f-type"><option value="electric" ${editing?.type==="electric"?"selected":""}>Buýt điện</option><option value="regular" ${editing?.type==="regular"?"selected":""}>Buýt thường</option></select></div>
      </div>
      <div class="ad-form-row"><label>Tên tuyến</label><input id="f-name" value="${editing?.name||""}" placeholder="VD: Bến A – Bến B"></div>
      <div class="ad-form-grid-3">
        <div class="ad-form-row"><label>Giá vé (đ)</label><input id="f-price" type="number" value="${editing?.price||8000}"></div>
        <div class="ad-form-row"><label>Tần suất (phút)</label><input id="f-frequency" type="number" value="${editing?.frequency||15}"></div>
        <div class="ad-form-row"><label>Màu</label><input id="f-color" type="color" value="${editing?.color||"#1FAE7C"}" style="height:42px;padding:2px"></div>
      </div>
      <div class="ad-form-grid-2">
        <div class="ad-form-row"><label>Giờ bắt đầu</label><input id="f-hs" type="time" value="${editing?.hours?.start||"05:00"}"></div>
        <div class="ad-form-row"><label>Giờ kết thúc</label><input id="f-he" type="time" value="${editing?.hours?.end||"22:00"}"></div>
      </div>
      <div class="ad-form-row">
        <label>Trạm dừng <span style="color:var(--ink-soft);font-weight:400">(tên + số phút từ điểm đầu)</span></label>
        <div id="stopsContainer">${(editing?.stops||[{name:"",t:0},{name:"",t:0}]).map(s=>stopRowHTML(s.name,s.t)).join("")}</div>
        <button type="button" class="vg-btn-link" style="align-self:flex-start;padding:6px 0" onclick="AdminApp.addStop()">+ Thêm trạm</button>
      </div>
      <div style="display:flex;gap:10px;margin-top:18px">
        <button class="vg-btn vg-btn-ghost" style="flex:1" onclick="AdminApp.closeModal()">Hủy</button>
        <button class="vg-btn vg-btn-primary" style="flex:1" onclick="AdminApp.saveRoute()">Lưu tuyến</button>
      </div>
    </div>
  </div>`:"";
  return`
  <div class="ad-panel">
    <div class="ad-panel-title">
      <span>Danh sách tuyến xe (${ROUTES.length})</span>
      <button class="vg-btn vg-btn-primary" style="padding:9px 16px;font-size:13px" onclick="AdminApp.openRouteModal(null)">${icon("plus",15)} Thêm tuyến mới</button>
    </div>
    <div class="ad-table-wrap"><table class="ad-table">
      <thead><tr><th>Mã</th><th>Tên tuyến</th><th>Loại</th><th>Giá vé</th><th>Tần suất</th><th>Giờ hoạt động</th><th>Trạm</th><th></th></tr></thead>
      <tbody>${ROUTES.map(r=>`<tr>
        <td><span class="ad-route-code-badge" style="background:${r.color}1A;color:${r.color}">${r.code}</span></td>
        <td>${r.name}</td><td>${r.type==="electric"?"⚡ Điện":"Thường"}</td>
        <td style="font-family:'IBM Plex Mono'">${fmtVND(r.price)}</td>
        <td>${r.frequency} phút</td><td style="font-family:'IBM Plex Mono'">${r.hours.start}–${r.hours.end}</td>
        <td>${r.stops.length}</td>
        <td><div class="ad-row-actions">
          <button class="ad-icon-btn" onclick="AdminApp.openRouteModal('${r.id}')">${icon("pencil",14)}</button>
          <button class="ad-icon-btn danger" onclick="AdminApp.deleteRoute('${r.id}')">${icon("trash-2",14)}</button>
        </div></td>
      </tr>`).join("")}</tbody>
    </table></div>
  </div>${modal}`;
}

function adBookings(){
  return`
  <div class="ad-panel">
    <div class="ad-panel-title"><span>Vé đã đặt (${DEMO_BOOKINGS.length})</span></div>
    <div class="ad-table-wrap"><table class="ad-table">
      <thead><tr><th>Mã vé</th><th>Tuyến</th><th>Khách hàng</th><th>Ngày</th><th>Giờ</th><th>Số vé</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
      <tbody>${DEMO_BOOKINGS.map(b=>`<tr>
        <td style="font-family:'IBM Plex Mono'">${b.id}</td><td>${b.routeCode}</td><td>${b.customer}</td>
        <td>${b.date}</td><td>${b.time}</td><td>${b.count}</td><td style="font-family:'IBM Plex Mono'">${fmtVND(b.total)}</td>
        <td><select class="ad-status-select" onchange="AdminApp.setBookingStatus('${b.id}',this.value)">
          <option value="confirmed" ${b.status==="confirmed"?"selected":""}>Đã xác nhận</option>
          <option value="used" ${b.status==="used"?"selected":""}>Đã sử dụng</option>
          <option value="cancelled" ${b.status==="cancelled"?"selected":""}>Đã hủy</option>
        </select></td>
      </tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}

function adPasses(){
  return`
  <div class="ad-panel">
    <div class="ad-panel-title"><span>Thẻ tháng đã bán (${DEMO_PASSES.length})</span></div>
    <div class="ad-table-wrap"><table class="ad-table">
      <thead><tr><th>Mã vé</th><th>Tuyến</th><th>Khách hàng</th><th>Loại thẻ</th><th>Ngày mua</th><th>Hết hạn</th><th>Giá</th><th>Trạng thái</th></tr></thead>
      <tbody>${DEMO_PASSES.map(p=>`<tr>
        <td style="font-family:'IBM Plex Mono'">${p.id}</td><td>${p.routeCode}</td><td>${p.customer}</td>
        <td>${p.planLabel}</td><td>${p.purchaseDate}</td><td>${p.expiry}</td>
        <td style="font-family:'IBM Plex Mono'">${fmtVND(p.total)}</td>
        <td><select class="ad-status-select" onchange="AdminApp.setPassStatus('${p.id}',this.value)">
          <option value="active" ${p.status==="active"?"selected":""}>Đang hoạt động</option>
          <option value="expired" ${p.status==="expired"?"selected":""}>Hết hạn</option>
        </select></td>
      </tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}

function adDrivers(){
  const modal=S.driverModalOpen?`
  <div class="ad-modal-overlay" onmousedown="if(event.target===this)AdminApp.closeModal()">
    <div class="ad-modal">
      <h2>Thêm tài xế mới</h2>
      <div class="ad-form-grid-2">
        <div class="ad-form-row"><label>Họ và tên</label><input id="d-name" placeholder="Nguyễn Văn A"></div>
        <div class="ad-form-row"><label>Số điện thoại</label><input id="d-phone" placeholder="0912 345 678"></div>
      </div>
      <div class="ad-form-grid-2">
        <div class="ad-form-row"><label>Biển số xe</label><input id="d-vehicle" placeholder="51B-123.45"></div>
        <div class="ad-form-row"><label>Tuyến phụ trách</label><select id="d-route">${ROUTES.map(r=>`<option value="${r.code}">${r.code} · ${r.name}</option>`).join("")}</select></div>
      </div>
      <div class="ad-form-grid-2">
        <div class="ad-form-row"><label>Trạng thái</label><select id="d-status"><option value="on_duty">Đang trực</option><option value="off_duty">Nghỉ</option><option value="maintenance">Bảo dưỡng</option></select></div>
        <div class="ad-form-row"><label>Đánh giá ban đầu</label><input id="d-rating" type="number" min="1" max="5" value="5" step="0.1"></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:18px">
        <button class="vg-btn vg-btn-ghost" style="flex:1" onclick="AdminApp.closeModal()">Hủy</button>
        <button class="vg-btn vg-btn-primary" style="flex:1" onclick="AdminApp.saveDriver()">Thêm tài xế</button>
      </div>
    </div>
  </div>`:"";
  return`
  <div class="ad-panel">
    <div class="ad-panel-title">
      <span>Tài xế & Xe (${DEMO_DRIVERS.length})</span>
      <button class="vg-btn vg-btn-primary" style="padding:9px 16px;font-size:13px" onclick="AdminApp.openDriverModal()">${icon("plus",15)} Thêm tài xế</button>
    </div>
    <div class="ad-table-wrap"><table class="ad-table">
      <thead><tr><th>Tài xế</th><th>SĐT</th><th>Biển số xe</th><th>Tuyến</th><th>Đánh giá</th><th>Trạng thái</th></tr></thead>
      <tbody>${DEMO_DRIVERS.map(d=>`<tr>
        <td><div style="display:flex;align-items:center;gap:10px"><div class="ad-driver-avatar">${d.name[0]}</div><span>${d.name}</span></div></td>
        <td>${d.phone}</td><td style="font-family:'IBM Plex Mono'">${d.vehicle}</td>
        <td><span class="ad-route-code-badge" style="background:#1FAE7C1A;color:#1FAE7C">${d.routeCode}</span></td>
        <td><span style="color:#F59E0B">★</span> ${d.rating}</td>
        <td><select class="ad-status-select" onchange="AdminApp.setDriverStatus('${d.id}',this.value)">
          <option value="on_duty" ${d.status==="on_duty"?"selected":""}>Đang trực</option>
          <option value="off_duty" ${d.status==="off_duty"?"selected":""}>Nghỉ</option>
          <option value="maintenance" ${d.status==="maintenance"?"selected":""}>Bảo dưỡng</option>
        </select></td>
      </tr>`).join("")}</tbody>
    </table></div>
  </div>${modal}`;
}

function adPromos(){
  const modal=S.promoModalOpen?`
  <div class="ad-modal-overlay" onmousedown="if(event.target===this)AdminApp.closeModal()">
    <div class="ad-modal">
      <h2>Tạo mã khuyến mãi mới</h2>
      <div class="ad-form-row"><label>Mã giảm giá</label><input id="p-code" placeholder="VD: SUMMER2026" style="text-transform:uppercase"></div>
      <div class="ad-form-row"><label>Mô tả</label><input id="p-desc" placeholder="VD: Giảm 20% tất cả vé"></div>
      <div class="ad-form-grid-2">
        <div class="ad-form-row"><label>Giảm giá</label><input id="p-discount" placeholder="VD: 10% hoặc 5000" value="10%"></div>
        <div class="ad-form-row"><label>Giới hạn lượt dùng</label><input id="p-limit" type="number" value="100"></div>
      </div>
      <div class="ad-form-row"><label>Ngày hết hạn</label><input id="p-expiry" type="date"></div>
      <div style="display:flex;gap:10px;margin-top:18px">
        <button class="vg-btn vg-btn-ghost" style="flex:1" onclick="AdminApp.closeModal()">Hủy</button>
        <button class="vg-btn vg-btn-primary" style="flex:1" onclick="AdminApp.savePromo()">Tạo mã</button>
      </div>
    </div>
  </div>`:"";
  return`
  <div class="ad-panel">
    <div class="ad-panel-title">
      <span>Mã khuyến mãi (${DEMO_PROMOS.length})</span>
      <button class="vg-btn vg-btn-primary" style="padding:9px 16px;font-size:13px" onclick="AdminApp.openPromoModal()">${icon("plus",15)} Tạo mã mới</button>
    </div>
    <div class="ad-table-wrap"><table class="ad-table">
      <thead><tr><th>Mã</th><th>Mô tả</th><th>Giảm giá</th><th>Đã dùng</th><th>Giới hạn</th><th>Hết hạn</th><th>Trạng thái</th><th></th></tr></thead>
      <tbody>${DEMO_PROMOS.map(p=>`<tr>
        <td><span class="ad-promo-code-display">${p.code}</span></td>
        <td>${p.desc}</td><td>${p.discount}</td>
        <td><div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:6px;background:var(--surface-2);border-radius:3px;overflow:hidden"><div style="height:100%;width:${Math.round(p.uses/p.limit*100)}%;background:var(--accent);border-radius:3px"></div></div>${p.uses}/${p.limit}</div></td>
        <td>${p.limit}</td><td>${p.expiry}</td>
        <td>${p.status==="active"?`<span class="ad-badge success">Đang hoạt động</span>`:`<span class="ad-badge muted">Hết hạn</span>`}</td>
        <td><button class="ad-icon-btn danger" onclick="AdminApp.deletePromo('${p.id}')">${icon("trash-2",14)}</button></td>
      </tr>`).join("")}</tbody>
    </table></div>
  </div>${modal}`;
}

function adSettings(){
  return`
  <div class="ad-panel" style="max-width:480px">
    <div class="ad-panel-title">Đổi mật khẩu quản trị viên</div>
    <p style="font-size:12px;color:var(--ink-soft);margin:-6px 0 16px">Đang đăng nhập với tài khoản: <b>${S.currentAdmin?.email||""}</b></p>
    ${S.adminPwError?`<div class="auth-error" style="margin-bottom:14px">${S.adminPwError}</div>`:""}
    ${S.adminPwSuccess?`<div class="auth-success" style="margin-bottom:14px">${S.adminPwSuccess}</div>`:""}
    <div class="ad-form-row"><label>Mật khẩu hiện tại</label><input id="pw-old" type="password" placeholder="Nhập mật khẩu hiện tại"></div>
    <div class="ad-form-row"><label>Mật khẩu mới</label><input id="pw-new" type="password" placeholder="Tối thiểu 6 ký tự"></div>
    <div class="ad-form-row"><label>Xác nhận mật khẩu mới</label><input id="pw-confirm" type="password" placeholder="Nhập lại mật khẩu mới" onkeydown="if(event.key==='Enter')AdminApp.changePassword()"></div>
    <button class="vg-btn vg-btn-primary" style="width:100%;margin-top:6px" onclick="AdminApp.changePassword()">Đổi mật khẩu</button>
  </div>`;
}

/* ======================== ADMIN CONTROLLER ======================== */
const AdminApp={
  sec(s){S.adminSection=s;S.adminModal=null;S.promoModalOpen=false;S.driverModalOpen=false;S.adminPwError="";S.adminPwSuccess="";render()},
  period(p){S.adminPeriod=p;render()},
  openRouteModal(id){S.adminModal={type:"route",id};render()},
  closeModal(){S.adminModal=null;S.promoModalOpen=false;S.driverModalOpen=false;render()},
  addStop(){document.getElementById("stopsContainer")?.insertAdjacentHTML("beforeend",stopRowHTML("",0));if(window.lucide)lucide.createIcons()},
  async saveRoute(){
    const g=id=>document.getElementById(id);
    const code=g("f-code")?.value.trim(),name=g("f-name")?.value.trim(),type=g("f-type")?.value;
    const price=parseInt(g("f-price")?.value)||0,frequency=parseInt(g("f-frequency")?.value)||1;
    const hs=g("f-hs")?.value||"05:00",he=g("f-he")?.value||"22:00",color=g("f-color")?.value||"#1FAE7C";
    const rows=document.querySelectorAll("#stopsContainer .ad-stop-row-edit");
    const stops=[];rows.forEach(row=>{const nm=row.querySelector(".sni")?.value.trim(),tt=parseInt(row.querySelector(".sti")?.value)||0;if(nm)stops.push({name:nm,t:tt})});
    stops.sort((a,b)=>a.t-b.t);
    if(!code||!name||stops.length<2){if(g("formError"))g("formError").textContent="Vui lòng nhập đủ thông tin và ít nhất 2 trạm.";return}
    const payload={code,name,type,price,frequency,hours:{start:hs,end:he},color,stops};
    try{
      if(S.adminModal?.id){
        const updated=await apiSend("PUT","/routes/"+S.adminModal.id,payload);
        const idx=ROUTES.findIndex(r=>r.id===S.adminModal.id);if(idx>-1)ROUTES[idx]=updated;
      }else{
        const created=await apiSend("POST","/routes",payload);
        ROUTES.push(created);
      }
      STOP_NAMES=getStopNames();
      S.adminModal=null;render();
    }catch(err){if(g("formError"))g("formError").textContent=err.message;}
  },
  async deleteRoute(id){
    if(!confirm("Xóa tuyến này?"))return;
    await apiSend("DELETE","/routes/"+id);
    ROUTES.splice(ROUTES.findIndex(r=>r.id===id),1);
    STOP_NAMES=getStopNames();
    render();
  },
  async setBookingStatus(id,v){
    await apiSend("PATCH","/bookings/"+id,{status:v});
    const b=DEMO_BOOKINGS.find(x=>x.id===id);if(b)b.status=v;render();
  },
  async setPassStatus(id,v){
    await apiSend("PATCH","/passes/"+id,{status:v});
    const p=DEMO_PASSES.find(x=>x.id===id);if(p)p.status=v;render();
  },
  async setDriverStatus(id,v){
    await apiSend("PATCH","/drivers/"+id,{status:v});
    const d=DEMO_DRIVERS.find(x=>x.id===id);if(d)d.status=v;render();
  },
  openPromoModal(){S.promoModalOpen=true;render()},
  async savePromo(){
    const code=document.getElementById("p-code")?.value.trim().toUpperCase();
    const desc=document.getElementById("p-desc")?.value.trim();
    const discount=document.getElementById("p-discount")?.value.trim()||"0";
    const limit=parseInt(document.getElementById("p-limit")?.value)||100;
    const expiry=document.getElementById("p-expiry")?.value;
    if(!code||!desc){alert("Nhập đủ thông tin.");return}
    try{
      const created=await apiSend("POST","/promos",{code,desc,discount,limit,expiry:expiry||"—"});
      DEMO_PROMOS.unshift(created);
      S.promoModalOpen=false;render();
    }catch(err){alert(err.message);}
  },
  async deletePromo(id){
    if(!confirm("Xóa mã này?"))return;
    await apiSend("DELETE","/promos/"+id);
    DEMO_PROMOS.splice(DEMO_PROMOS.findIndex(p=>p.id===id),1);
    render();
  },
  openDriverModal(){S.driverModalOpen=true;render()},
  async saveDriver(){
    const name=document.getElementById("d-name")?.value.trim();
    const phone=document.getElementById("d-phone")?.value.trim();
    const vehicle=document.getElementById("d-vehicle")?.value.trim();
    const routeCode=document.getElementById("d-route")?.value;
    const status=document.getElementById("d-status")?.value||"off_duty";
    const rating=parseFloat(document.getElementById("d-rating")?.value)||5;
    if(!name||!phone){alert("Vui lòng nhập họ tên và số điện thoại.");return}
    try{
      const created=await apiSend("POST","/drivers",{name,phone,vehicle,routeCode,status,rating});
      DEMO_DRIVERS.unshift(created);
      S.driverModalOpen=false;render();
    }catch(err){alert(err.message);}
  },
  async doLogin(){
    const email=document.getElementById("ad-email")?.value.trim();
    const password=document.getElementById("ad-password")?.value;
    if(!email||!password){S.authError="Vui lòng nhập email và mật khẩu.";renderAdminLogin();return}
    try{
      const admin=await apiSend("POST","/auth/admin-login",{email,password});
      S.currentAdmin=admin;S.authError="";
      await loadAdminData();
      render();
    }catch(err){S.authError=err.message;renderAdminLogin();}
  },
  async doLogout(){
    try{await apiSend("POST","/auth/admin-logout")}catch(e){}
    S.currentAdmin=null;renderAdminLogin();
  },
  async changePassword(){
    const oldPassword=document.getElementById("pw-old")?.value||"";
    const newPassword=document.getElementById("pw-new")?.value||"";
    const confirm=document.getElementById("pw-confirm")?.value||"";
    S.adminPwError="";S.adminPwSuccess="";
    if(!oldPassword||!newPassword){S.adminPwError="Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới.";render();return}
    if(newPassword.length<6){S.adminPwError="Mật khẩu mới phải có tối thiểu 6 ký tự.";render();return}
    if(newPassword!==confirm){S.adminPwError="Xác nhận mật khẩu mới không khớp.";render();return}
    try{
      await apiSend("PATCH","/auth/admin-password",{oldPassword,newPassword});
      S.adminPwSuccess="Đổi mật khẩu thành công.";
      render();
    }catch(err){S.adminPwError=err.message;render();}
  },
};

/* ======================== RENDER ======================== */
function sMap(){
  return`
  <div class="vg-header is-light">
    <div><div class="vg-title">Bản đồ tuyến xe</div><div class="vg-subtitle">Xem tất cả tuyến xe buýt trên bản đồ</div></div>
  </div>
  <div class="vg-content screen-enter" style="padding:0;gap:0">
    <div id="leaflet-map" class="vg-leaflet-map"></div>
    <div id="map-legend" style="padding:14px 16px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;gap:6px">
      ${ROUTES.map(r=>`<span class="vg-chip" style="background:${r.color}1A;color:${r.color};border:1px solid ${r.color}44;cursor:pointer" onclick="App.openDetailHome('${r.id}')">${r.code}</span>`).join("")}
    </div>
  </div>`;
}

const C_SCREENS={home:sHome,results:sResults,detail:sDetail,booking:sBooking,pass:sPass,"pass-multi":sPassMulti,confirm:sConfirm,tickets:sTickets,notifications:sNotifications,tracking:sTracking,favorites:sFavorites,history:sHistory,rating:sRating,other:sOther,login:sLogin,register:sRegister,map:sMap,"student-verify":sStudentVerify};
const AD_SECTIONS={overview:adOverview,routes:adRoutes,bookings:adBookings,passes:adPasses,drivers:adDrivers,promos:adPromos,settings:adSettings};

function isAdmin(){return document.body.classList.contains("admin-body")}

/* ======================== BẢN ĐỒ (Leaflet + OpenStreetMap - miễn phí) ======================== */
let DETAIL_MAP=null,TRACK_MAP=null,TRACK_MARKER=null,LEAFLET_MAP=null;

function stopsWithCoords(r){return (r.stops||[]).filter(s=>typeof s.lat==="number"&&typeof s.lng==="number")}

function drawRouteOnLeaflet(map,r,pts){
  const latlngs=pts.map(s=>[s.lat,s.lng]);
  L.polyline(latlngs,{color:r.color,weight:4,opacity:.85}).addTo(map);
  const bounds=[];
  pts.forEach((s,i)=>{
    const isEdge=i===0||i===pts.length-1;
    const icon=L.divIcon({
      className:'leaflet-stop-marker',
      html:`<div style="width:${isEdge?14:10}px;height:${isEdge?14:10}px;border-radius:50%;background:${r.color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
      iconSize:[14,14],
      iconAnchor:[7,7],
    });
    L.marker([s.lat,s.lng],{icon}).addTo(map).bindPopup(`<b style="font-family:Inter,sans-serif;font-size:12px">${s.name}</b>`);
    bounds.push([s.lat,s.lng]);
  });
  if(bounds.length>1)map.fitBounds(bounds,{padding:[24,24]});
}

function busLeafletIcon(color){
  return L.divIcon({
    className:'leaflet-bus-marker',
    html:`<div style="width:34px;height:34px;border-radius:50%;background:${color};border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 6px rgba(0,0,0,.3)">🚌</div>`,
    iconSize:[34,34],
    iconAnchor:[17,17],
  });
}

/* Khởi tạo bản đồ chi tiết tuyến (trang detail) */
function initDetailMap(){
  const r=getRoute(S.activeRouteId);
  const el=document.getElementById("detail-map");
  if(!r||!el||!window.L)return;
  const pts=stopsWithCoords(r);
  if(pts.length<2){el.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--ink-soft);font-size:12px;text-align:center;padding:12px">Chưa có dữ liệu bản đồ cho tuyến này</div>`;return}
  if(DETAIL_MAP){DETAIL_MAP.remove();DETAIL_MAP=null}
  DETAIL_MAP=L.map(el).setView([pts[0].lat,pts[0].lng],13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap',maxZoom:18}).addTo(DETAIL_MAP);
  drawRouteOnLeaflet(DETAIL_MAP,r,pts);
}

/* Khởi tạo bản đồ theo dõi xe (trang tracking) */
function initTrackingMap(){
  const r=getRoute(S.trackRouteId||S.activeRouteId);
  const el=document.getElementById("tracking-map");
  if(!r||!el||!window.L)return;
  const pts=stopsWithCoords(r);
  if(pts.length<2){el.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--ink-soft);font-size:12px;text-align:center;padding:12px">Chưa có dữ liệu bản đồ cho tuyến này</div>`;return}
  if(TRACK_MAP){TRACK_MAP.remove();TRACK_MAP=null}
  TRACK_MAP=L.map(el).setView([pts[0].lat,pts[0].lng],14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap',maxZoom:18}).addTo(TRACK_MAP);
  drawRouteOnLeaflet(TRACK_MAP,r,pts);
  // Tạo marker xe buýt
  TRACK_MARKER=L.marker([pts[0].lat,pts[0].lng],{icon:busLeafletIcon(r.color),zIndexOffset:999}).addTo(TRACK_MAP);
}

/* Cập nhật vị trí xe buýt trên bản đồ theo dõi */
function moveBusMarker(r,fromIdx,toIdx,frac){
  if(!TRACK_MARKER)return;
  const pts=stopsWithCoords(r);
  const a=pts[fromIdx],b=pts[toIdx];
  if(!a||!b)return;
  const lat=a.lat+(b.lat-a.lat)*frac;
  const lng=a.lng+(b.lng-a.lng)*frac;
  TRACK_MARKER.setLatLng([lat,lng]);
}

/* Khởi tạo bản đồ tổng quan (tab "Bản đồ") */
function initLeafletMap(){
  const el=document.getElementById("leaflet-map");
  if(!el||!window.L)return;
  if(LEAFLET_MAP){LEAFLET_MAP.remove();LEAFLET_MAP=null}
  LEAFLET_MAP=L.map(el).setView([21.0285,105.8542],12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap',maxZoom:18}).addTo(LEAFLET_MAP);
  ROUTES.forEach(r=>{
    const pts=stopsWithCoords(r);
    if(pts.length<2)return;
    const latlngs=pts.map(s=>[s.lat,s.lng]);
    L.polyline(latlngs,{color:r.color,weight:3,opacity:.8}).addTo(LEAFLET_MAP);
    pts.forEach((s,i)=>{
      const isEdge=i===0||i===pts.length-1;
      const icon=L.divIcon({
        className:'leaflet-stop-marker',
        html:`<div style="width:${isEdge?14:10}px;height:${isEdge?14:10}px;border-radius:50%;background:${r.color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
        iconSize:[14,14],
        iconAnchor:[7,7],
      });
      L.marker([s.lat,s.lng],{icon}).addTo(LEAFLET_MAP).bindPopup(`<strong>${s.name}</strong><br/>${r.code} · ${r.name} ${isEdge?'· Điểm đầu/cuối':''}`);
    });
  });
  setTimeout(()=>{if(LEAFLET_MAP)LEAFLET_MAP.invalidateSize()},200);
}


const NAV_ITEMS=[
  {v:"home",ic:"search",l:"Tìm tuyến"},
  {v:"map",ic:"map",l:"Bản đồ"},
  {v:"tickets",ic:"ticket",l:"Vé của tôi"},
  {v:"other",ic:"more-horizontal",l:"Khác"},
];

function render(){
  if(isAdmin()){
    const secFn=AD_SECTIONS[S.adminSection]||adOverview;
    document.getElementById("root").innerHTML=`<div class="ad-layout">${adSidebar(S.adminSection)}<div class="ad-main">${adTopbar(...{overview:["Tổng quan","Thống kê hoạt động hệ thống"],routes:["Quản lý tuyến xe","Thêm, sửa, xóa tuyến và trạm dừng"],bookings:["Vé đã đặt","Theo dõi và cập nhật trạng thái vé lượt"],passes:["Thẻ tháng","Quản lý thẻ tháng đã bán"],drivers:["Tài xế & Xe","Quản lý tài xế và phương tiện"],promos:["Khuyến mãi","Tạo và quản lý mã giảm giá"],settings:["Cài đặt","Đổi mật khẩu tài khoản quản trị viên"]}[S.adminSection]||["Admin",""])}<div class="ad-content">${secFn()}</div></div></div>`;
  } else {
    const fn=C_SCREENS[S.view]||sHome;
    document.getElementById("root").innerHTML=`
    <div class="vg-frame">
      ${fn()}
      <div class="vg-bottom-nav">
        ${NAV_ITEMS.map(n=>`<button class="vg-nav-btn ${S.view===n.v||(n.v==="other"&&["notifications","favorites","history","student-verify"].includes(S.view))?"is-active":""}" onclick="App.tab('${n.v}')">${icon(n.ic,18)}<span>${n.l}</span></button>`).join("")}
      </div>
    </div>`;
    if(S.view==="detail")setTimeout(initDetailMap,0);
    if(S.view==="tracking")setTimeout(initTrackingMap,0);
    if(S.view==="map")setTimeout(initLeafletMap,100);
  }
  if(window.lucide)lucide.createIcons();
}

/* Check if admin page */
if(window.location.pathname.includes("admin")){
  document.body.classList.add("admin-body");
}

/* ======================== KHỞI ĐỘNG ======================== */
async function loadCustomerPublicData(){
  const [routes,promos]=await Promise.all([apiGet("/routes"),apiGet("/promos")]);
  ROUTES=routes;DEMO_PROMOS=promos;
  STOP_NAMES=getStopNames();
  // Load student discount rates
  try{
    const disc=await apiGet("/student-discount");
    STUDENT_DISCOUNT=disc;
  }catch(e){}
}

async function loadAdminData(){
  const [routes,bookings,passes,drivers,promos]=await Promise.all([
    apiGet("/routes"),apiGet("/bookings"),apiGet("/passes"),apiGet("/drivers"),apiGet("/promos"),
  ]);
  ROUTES=routes;DEMO_BOOKINGS=bookings;DEMO_PASSES=passes;DEMO_DRIVERS=drivers;DEMO_PROMOS=promos;
  STOP_NAMES=getStopNames();
}

function showBootError(err){
  console.error(err);
  document.getElementById("root").innerHTML=`<div style="padding:40px;text-align:center;font-family:sans-serif;color:#B23226">
    Không kết nối được backend. Hãy chắc chắn server đang chạy.<br><small>${err.message}</small></div>`;
}

async function boot(){
  if(isAdmin()){
    try{S.currentAdmin=await apiGet("/auth/admin-me")}catch(e){S.currentAdmin=null}
    if(!S.currentAdmin){renderAdminLogin();return}
    try{await loadAdminData()}catch(err){showBootError(err);return}
    render();
  }else{
    try{S.currentUser=await apiGet("/auth/me")}catch(e){S.currentUser=null}
    try{await loadCustomerPublicData()}catch(err){showBootError(err);return}
    render();
  }
}
boot();