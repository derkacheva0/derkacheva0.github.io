var userName = localStorage.getItem("userName");
var lvl1_cry = localStorage.getItem("lvl1_cry");
var lvl2_cry = localStorage.getItem("lvl2_cry");
var lvl3_cry = localStorage.getItem("lvl3_cry");

// Вставка значений в элементы на странице
document.getElementById("username").textContent = "Username: " + userName;
document.getElementById("lvl1_cry").textContent = "lvl1_cry: " + lvl1_cry;
document.getElementById("lvl2_cry").textContent = "lvl2_cry: " + lvl2_cry;
document.getElementById("lvl3_cry").textContent = "lvl3_cry: " + lvl3_cry;

if (lvl1_cry === "true" && lvl2_cry === "true" &&  lvl3_cry === "true") {
    document.querySelector(".image-ol").style.display = "block";
}
if (lvl1_cry === "true" && lvl2_cry === "false") {
    console.log("tear is OK")
    document.querySelector(".image-ter").style.display = "block";
}
if (lvl1_cry === "false" && lvl2_cry === "true") {
    console.log("Pleas, do NOT bite me")
    document.querySelector(".image-do").style.display = "block";
}
if (lvl1_cry === "false" && lvl2_cry === "false" &&  lvl3_cry === "true") {
    console.log("Real man")
    document.querySelector(".image-rel").style.display = "block";
}
if (lvl1_cry === "false" && lvl2_cry === "false" &&  lvl3_cry === "false") {
    console.log("I dont care, i want study")
    document.querySelector(".image-st").style.display = "block";
}