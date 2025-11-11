let objs = [];
let colors = ['#f71735', '#f7d002', '#1A53C0', '#232323'];
let sel;
let sel2;
let overlayDiv;
let overlayIframe;
let overlayTextDiv;
let closeBtn;
let showBio = false; // 新增：控制是否顯示自介

function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
    objs.push(new DynamicShape());

    sel = createSelect();
    sel.position(10, 10);
    sel.style('font-size', '24px');
    sel.style('padding', '6px 10px');
    sel.style('font-weight', '600');
    sel.style('font-family', 'Arial, sans-serif');
    sel.style('color', '#222');
    sel.style('background-color', 'rgba(255,255,255,0.9)');
    sel.style('border-radius', '6px');
    sel.option('自介');
    sel.option('氣球上飄'); // 原：作品一
    sel.option('氣球爆炸小遊戲'); // 原：作品二
    sel.option('氣球筆記'); // 原：作品三
    sel.option('測驗'); 
    sel.option('測驗筆記');
    sel.option('淡江大學');
    sel.selected('氣球上飄');
    sel.changed(onMenuChange);

    sel2 = createSelect();
    sel2.position(10, 60);
    sel2.style('font-size', '18px');
    sel2.style('padding', '4px 8px');
    sel2.style('font-family', 'Arial, sans-serif');
    sel2.style('background-color', 'rgba(255,255,255,0.9)');
    sel2.style('border-radius', '6px');
    sel2.option('教育科技學系');
    // sel2.option('測驗筆記'); // 已移除，測驗筆記改為主選單
    sel2.changed(onSubMenuChange);
    sel2.hide();

    onMenuChange();
}

function draw() {
    // 只在非自介模式時清除背景
    if (!showBio) {
        background(255);
    } else {
        // 自介模式：淺色背景，文字保持顯示
        background(245);
    }
    for (let i of objs) {
        i.run();
    }

    if (frameCount % int(random([15, 30])) == 0) {
        let addNum = int(random(1, 30));
        for (let i = 0; i < addNum; i++) {
            objs.push(new DynamicShape());
        }
    }
    for (let i = 0; i < objs.length; i++) {
        if (objs[i].isDead) {
            objs.splice(i, 1);
        }
    }

    // 新增：如果顯示自介，直接在畫布上繪製文字
    if (showBio) {
        push();
        fill(51);
        textAlign(CENTER, CENTER);
        textSize(48);
        textFont('Arial, sans-serif');
        textStyle(BOLD);
        text('414730936 陸柏安', width / 2, height / 2);
        pop();
    }
}

function easeInOutExpo(x) {
    return x === 0 ? 0 :
        x === 1 ?
        1 :
        x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 :
        (2 - Math.pow(2, -20 * x + 10)) / 2;
}

class DynamicShape {
    constructor() {
        this.x = random(0.3, 0.7) * width;
        this.y = random(0.3, 0.7) * height;
        this.reductionRatio = 1;
        this.shapeType = int(random(4));
        this.animationType = 0;
        this.maxActionPoints = int(random(2, 5));
        this.actionPoints = this.maxActionPoints;
        this.elapsedT = 0;
        this.size = 0;
        this.sizeMax = width * random(0.01, 0.05);
        this.fromSize = 0;
        this.init();
        this.isDead = false;
        this.clr = random(colors);
        this.changeShape = true;
        this.ang = int(random(2)) * PI * 0.25;
        this.lineSW = 0;
    }

    show() {
        push();
        translate(this.x, this.y);
        if (this.animationType == 1) scale(1, this.reductionRatio);
        if (this.animationType == 2) scale(this.reductionRatio, 1);
        fill(this.clr);
        stroke(this.clr);
        strokeWeight(this.size * 0.05);
        if (this.shapeType == 0) {
            noStroke();
            circle(0, 0, this.size);
        } else if (this.shapeType == 1) {
            noFill();
            circle(0, 0, this.size);
        } else if (this.shapeType == 2) {
            noStroke();
            rect(0, 0, this.size, this.size);
        } else if (this.shapeType == 3) {
            noFill();
            rect(0, 0, this.size * 0.9, this.size * 0.9);
        } else if (this.shapeType == 4) {
            line(0, -this.size * 0.45, 0, this.size * 0.45);
            line(-this.size * 0.45, 0, this.size * 0.45, 0);
        }
        pop();
        strokeWeight(this.lineSW);
        stroke(this.clr);
        line(this.x, this.y, this.fromX, this.fromY);
    }

    move() {
        let n = easeInOutExpo(norm(this.elapsedT, 0, this.duration));
        if (0 < this.elapsedT && this.elapsedT < this.duration) {
            if (this.actionPoints == this.maxActionPoints) {
                this.size = lerp(0, this.sizeMax, n);
            } else if (this.actionPoints > 0) {
                if (this.animationType == 0) {
                    this.size = lerp(this.fromSize, this.toSize, n);
                } else if (this.animationType == 1) {
                    this.x = lerp(this.fromX, this.toX, n);
                    this.lineSW = lerp(0, this.size / 5, sin(n * PI));
                } else if (this.animationType == 2) {
                    this.y = lerp(this.fromY, this.toY, n);
                    this.lineSW = lerp(0, this.size / 5, sin(n * PI));
                } else if (this.animationType == 3) {
                    if (this.changeShape == true) {
                        this.shapeType = int(random(5));
                        this.changeShape = false;
                    }
                }
                this.reductionRatio = lerp(1, 0.3, sin(n * PI));
            } else {
                this.size = lerp(this.fromSize, 0, n);
            }
        }

        this.elapsedT++;
        if (this.elapsedT > this.duration) {
            this.actionPoints--;
            this.init();
        }
        if (this.actionPoints < 0) {
            this.isDead = true;
        }
    }

    run() {
        this.show();
        this.move();
    }

    init() {
        this.elapsedT = 0;
        this.fromSize = this.size;
        this.toSize = this.sizeMax * random(0.5, 1.5);
        this.fromX = this.x;
        this.toX = this.fromX + (width / 10) * random([-1, 1]) * int(random(1, 4));
        this.fromY = this.y;
        this.toY = this.fromY + (height / 10) * random([-1, 1]) * int(random(1, 4));
        this.animationType = int(random(3));
        this.duration = random(20, 50);
    }
}

// 新增：顯示/隱藏覆蓋 iframe（可傳入 url 或 special type）
function showSiteOverlay(urlOrType) {
    if (!overlayDiv) {
        overlayDiv = createDiv('');
        overlayDiv.style('position', 'absolute');
        overlayDiv.style('left', '50%');
        overlayDiv.style('top', '50%');
        overlayDiv.style('transform', 'translate(-50%,-50%)');
        overlayDiv.style('width', '80vw');
        overlayDiv.style('height', '80vh');
        overlayDiv.style('z-index', '100000');
        overlayDiv.style('background-color', '#ffffff');
        overlayDiv.style('box-shadow', '0 8px 30px rgba(0,0,0,0.5)');
        overlayDiv.style('border-radius', '8px');
        overlayDiv.style('overflow', 'hidden');

        // 建立 iframe 並加入 overlayDiv
        overlayIframe = createElement('iframe');
        overlayIframe.attribute('src', 'about:blank');
        overlayIframe.style('width', '100%');
        overlayIframe.style('height', '100%');
        overlayIframe.style('border', '0');
        overlayIframe.style('border-radius', '8px');
        overlayIframe.parent(overlayDiv);

        // 建立文字顯示容器（用於自介）
        overlayTextDiv = createDiv('');
        overlayTextDiv.style('width', '100%');
        overlayTextDiv.style('height', '100%');
        overlayTextDiv.style('display', 'flex');
        overlayTextDiv.style('align-items', 'center');
        overlayTextDiv.style('justify-content', 'center');
        overlayTextDiv.style('font-size', '32px');
        overlayTextDiv.style('font-weight', '700');
        overlayTextDiv.style('font-family', 'Arial, sans-serif');
        overlayTextDiv.style('color', '#222');
        overlayTextDiv.style('padding', '20px');
        overlayTextDiv.hide();
        overlayTextDiv.parent(overlayDiv);

        // 建立關閉按鈕
        closeBtn = createButton('關閉');
        closeBtn.parent(overlayDiv);
        closeBtn.style('position', 'absolute');
        closeBtn.style('right', '8px');
        closeBtn.style('top', '8px');
        closeBtn.style('z-index', '100001');
        closeBtn.style('padding', '6px 10px');
        closeBtn.style('font-size', '14px');
        closeBtn.mousePressed(hideSiteOverlay);
    } else {
        // 已存在時先重置顯示內容
        if (overlayIframe) overlayIframe.attribute('src', 'about:blank');
        if (overlayTextDiv) overlayTextDiv.hide();
        if (overlayIframe) overlayIframe.show();
    }

    // 根據傳入的型別處理顯示
    if (urlOrType === 'bio') {
        // 顯示自介文字
        if (overlayTextDiv) {
            overlayTextDiv.html('414730936 陸柏安');
            overlayTextDiv.show();
        }
        if (overlayIframe) overlayIframe.hide();
    } else if (typeof urlOrType === 'string' && urlOrType.startsWith('http')) {
        // 顯示網頁
        if (overlayIframe) {
            overlayIframe.attribute('src', urlOrType);
            overlayIframe.show();
        }
        if (overlayTextDiv) overlayTextDiv.hide();
    } else {
        // 預設顯示空白 iframe
        if (overlayIframe) overlayIframe.attribute('src', 'about:blank');
        if (overlayTextDiv) overlayTextDiv.hide();
    }

    overlayDiv.show();
}

function hideSiteOverlay() {
    if (overlayDiv) {
        // 停止 iframe 內容（避免背景音效持續）
        if (overlayIframe) overlayIframe.attribute('src', 'about:blank');
        overlayDiv.hide();
    }
}

// 新增：選menu變更處理（顯示不同網址或隱藏）
function onMenuChange() {
    const v = sel.value();
    sel2.hide();
    showBio = false;

    if (v === '自介') {
        colors = ['#f7f7f7', '#dcdcdc', '#bdbdbd', '#232323'];
        showBio = true;
        hideSiteOverlay();
    } else if (v === '氣球上飄') {
        colors = ['#f71735', '#f7d002', '#1A53C0', '#232323'];
        background(255);
        showSiteOverlay('https://lue950503-spec.github.io/20251014/');
    } else if (v === '氣球爆炸小遊戲') {
        colors = ['#0f4c5c', '#7fb069', '#f2d388', '#f4845f'];
        background(240);
        showSiteOverlay('https://lue950503-spec.github.io/20251014-2-/');
    } else if (v === '氣球筆記') {
        colors = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff'];
        background(235);
        showSiteOverlay('https://hackmd.io/@s4I8mCLfQjaFdMf2wg3qTw/BJ8Rjuyngg');
    } else if (v === '測驗') {
        colors = ['#8b9dc3', '#dfe3ee', '#f7f7f7', '#4d5061'];
        background(240);
        showSiteOverlay('https://lue950503-spec.github.io/1028-/');
    } else if (v === '測驗筆記') {
        colors = ['#8b9dc3', '#dfe3ee', '#f7f7f7', '#4d5061'];
        background(240);
        showSiteOverlay('https://hackmd.io/@s4I8mCLfQjaFdMf2wg3qTw/Sk6bC1vk-g');
    } else if (v === '淡江大學') {
        sel2.show();
        sel2.selected('教育科技學系');
        showSiteOverlay('https://www.et.tku.edu.tw/');
        colors = ['#2b5876', '#4e8ca6', '#a7d3ff', '#ffffff'];
        background(245);
    }

    objs = [];
    objs.push(new DynamicShape());
}

// 淡江大學子選單變更
function onSubMenuChange() {
    const sv = sel2.value();
    if (sv === '教育科技學系') {
        showSiteOverlay('https://www.et.tku.edu.tw/');
    }
}

// 新增：視窗大小改變時調整畫布
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // overlay 使用 css transform置中，無需額外處理
}
