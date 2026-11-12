// সার্ভিস ওয়ার্কার (অফলাইনে অ্যাপ খোলা) + "হোম স্ক্রিনে যোগ করুন" বোতাম
(function(){
 if("serviceWorker" in navigator)window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});
 /* কীবোর্ড খুললে নিচের বার ও ভাসমান বোতাম লুকায় (না হলে ওগুলো কীবোর্ডের ওপরে উঠে আসে) */
 var de=document.documentElement,base=0,txt=function(e){var t=e&&e.tagName;return t==="TEXTAREA"||(t==="INPUT"&&!/^(checkbox|radio|button|submit|range|file|color)$/.test(e.type))};
 function chk(){var h=window.visualViewport?visualViewport.height:innerHeight;base=Math.max(base,h,innerHeight);if(h<base-140)de.classList.add("kb");else if(!txt(document.activeElement))de.classList.remove("kb")}
 addEventListener("resize",chk);if(window.visualViewport)visualViewport.addEventListener("resize",chk);
 addEventListener("orientationchange",function(){base=0;setTimeout(chk,400)});
 document.addEventListener("focusin",function(e){if(txt(e.target))de.classList.add("kb")});
 document.addEventListener("focusout",function(){setTimeout(function(){if(!txt(document.activeElement)){var h=window.visualViewport?visualViewport.height:innerHeight;if(h>=base-140)de.classList.remove("kb")}},200)});
 var box=document.getElementById("drInst"),ev=null;
 var standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
 if(!box||standalone)return;
 addEventListener("beforeinstallprompt",function(e){e.preventDefault();ev=e;box.style.display="block";box.textContent="ফোনে অ্যাপ হিসেবে রাখুন ";var b=document.createElement("button");b.type="button";b.textContent="ইনস্টল";b.onclick=function(){ev.prompt();ev.userChoice.finally(function(){box.style.display="none";ev=null})};box.appendChild(b)});
 if(/iphone|ipad|ipod/i.test(navigator.userAgent)){box.style.display="block";box.textContent="আইফোনে: Safari-র শেয়ার বোতাম → “Add to Home Screen”"}
})();
