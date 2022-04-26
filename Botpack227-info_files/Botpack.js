"use strict";

updateCurrentNavPosition();
addEventListener("scroll", updateCurrentNavPosition);
document.getElementById("theme-selection").addEventListener("change", updateTheme);
initGalleryRegions();

function updateCurrentNavPosition() {
    setBottomContentHeight();

    let passedNavElem;
    let reachedNavElem;
    for (const navElem of document.querySelectorAll(".nav-target")) {
        if (!passedNavElem && hasPassedNavPosition(navElem)) {
            passedNavElem = navElem;
        }
        if (hasReachedNavPosition(navElem)) {
            reachedNavElem = navElem;
        } else {
            break;
        }
    }
    setSelectedNavElem(passedNavElem ?? reachedNavElem);
}

function hasPassedNavPosition(targetElem) {
    return targetElem.getBoundingClientRect().top >= 0 && hasReachedNavPosition(targetElem);
}

function hasReachedNavPosition(targetElem) {
    return targetElem.getBoundingClientRect().top < document.documentElement.clientHeight / 2;
}

function setSelectedNavElem(elem) {
    if (!elem) {
        return;
    }
    const link = document.querySelector(`[href="#${elem.id}"]`)
    if (!link || link.classList.contains("selected")) {
        return;
    }
    for (const navElem of document.querySelectorAll(".nav-container a")) {
        navElem.classList.remove("selected");
    }
    link.classList.add("selected");
}

function setBottomContentHeight() {
    const elem = document.getElementById("bottom-content");
    if (elem && elem.offsetHeight < document.documentElement.clientHeight / 2) {
        elem.style.height = document.documentElement.clientHeight + "px";
    }
}

function initGalleryRegions() {
    for (const img of document.querySelectorAll(".gallery img")) {
        img.addEventListener("click", createExpandedImageView);
    }
}

function createExpandedImageView(event) {
    let targetImg = event.target;
    let imgContainer;
    let img;
    let mapInfo;
    let mouseX = 0, mouseY = 0;

    createContainer();
    createImg();
    createArrow("backward");
    createArrow("forward");
    createMapInfo();

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousemove", handleMouseMove);
    const unScroll = preventScroll();

    function createContainer() {
        imgContainer = document.createElement("div");
        imgContainer.className = "expanded-image-container";
        document.body.append(imgContainer);
    }

    function createImg() {
        img = document.createElement("img");
        img.src = targetImg.src;
        img.className = "expanded-image";
        img.onclick = closeImageView;
        imgContainer.append(img);
    }

    function createArrow(direction) {
        let isForward = direction == "forward";
        const arrow = document.createElement("span");
        imgContainer.append(arrow);
        arrow.className = "gallery-arrow";
        arrow.textContent = isForward ? "►" : "◄";
        arrow.onmousedown = function (event) {
            event.preventDefault();
            isForward ? setNextImage() : setPriorImage();
        }
        if (isForward) {
            arrow.style.right = "10px";
        } else {
            arrow.style.left = "10px";
        }
    }

    function createMapInfo() {
        mapInfo = document.createElement("span");
        imgContainer.append(mapInfo);
        mapInfo.className = "gallery-map-info";
        mapInfo.addEventListener("transitionend", mapInfoTransitionEnd);
        setCurrentMapInfo();
    }

    function setPriorImage() {
        if (targetImg && img) {
            const parent = targetImg.parentElement;
            if (parent.previousElementSibling?.firstElementChild?.tagName == "IMG") {
                targetImg = parent.previousElementSibling.firstElementChild;
            } else {
                const list = targetImg.closest(".gallery");
                const item = list.lastElementChild;
                if (item?.firstElementChild?.tagName == "IMG") {
                    targetImg = item.firstElementChild;
                }
            }
            img.src = targetImg.src;
            setCurrentMapInfo();
        }
    }

    function setNextImage() {
        if (targetImg && img) {
            const parent = targetImg.parentElement;
            if (parent.nextElementSibling?.firstElementChild?.tagName == "IMG") {
                targetImg = parent.nextElementSibling.firstElementChild;
            } else {
                const list = targetImg.closest(".gallery");
                const item = list.firstElementChild;
                if (item?.firstElementChild?.tagName == "IMG") {
                    targetImg = item.firstElementChild;
                }
            }
            img.src = targetImg.src;
            setCurrentMapInfo();
        }
    }

    function setCurrentMapInfo() {
        if (mapInfo && targetImg) {
            let title;
            if (targetImg.title) {
                title = targetImg.title;
            } else {
                const filenameExt = targetImg.src.split('\\').pop().split('/').pop();
                title = filenameExt.split(".")[0];
            }
            mapInfo.textContent = title;

            if (targetImg.dataset.contrastTitle != undefined) {
                mapInfo.classList.add("contrast-shadow");
            } else {
                mapInfo.classList.remove("contrast-shadow");
            }

            showMapInfo();
        }
    }

    function showMapInfo() {
        if (mapInfo) {
            mapInfo.classList.remove("map-info-fadeout");
            mapInfo.classList.remove("hidden");
            setTimeout(() => mapInfo.classList.add("map-info-fadeout"), 0);
        }
    }

    function mapInfoTransitionEnd() {
        if (mapInfo?.classList.contains("map-info-fadeout")) {
            mapInfo.classList.add("hidden");
        }
    }

    function handleKeyDown(event) {
        switch (event.key) {
            case "Left":
            case "ArrowLeft":
                setPriorImage();
                break;
            case "Right":
            case "ArrowRight":
                setNextImage();
                break;
            case "Escape":
                closeImageView();
                break;
        }
    }

    function handleMouseMove(event) {
        const threshold = 5;
        if (Math.abs(event.clientX - mouseX) >= threshold ||
            Math.abs(event.clientY - mouseY) >= threshold
        ) {
            showMapInfo();
            mouseX = event.clientX;
            mouseY = event.clientY;
        }
    }

    function preventScroll() {
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        function unScroll() {
            window.scrollTo(scrollX, scrollY);
        }
        window.addEventListener("scroll", unScroll);
        return unScroll;
    }

    function allowScroll() {
        window.removeEventListener("scroll", unScroll);
    }

    function closeImageView() {
        imgContainer.remove();
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("mousemove", handleMouseMove);
        allowScroll();
    }
}

function updateTheme() {
    if (document.getElementById("theme-selection").value == "bright") {
        document.body.classList.add("bright-theme");
    } else {
        document.body.classList.remove("bright-theme");
    }
}
