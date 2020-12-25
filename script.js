let startBtn = document.querySelector(".start");
let restartBtn = document.querySelector(".restart");
let box = document.querySelector(".box");
let canvas = document.querySelector(".board");
let tool = canvas.getContext("2d");
let scoreElemrnt = document.querySelector("span");
let powerlevel = document.querySelector(".meter span")
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

// load earthimg
let score =0;
let fullpower =100;
let spaceImg = new Image();
spaceImg.src = "space (1).jpg";
let earthImg = new Image();
earthImg.src = "earth1.png";
let coronaImg = new Image();
coronaImg.src = "corona.png";
let eheight = 40;
let eWidth = 40;
let ePosX = canvas.width / 2 - 20;
let ePosY = canvas.height / 2 - 20;



class Corona {
    constructor(x, y, width, height, velocity) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = velocity;
    }
    draw() {
        tool.drawImage(coronaImg, this.x, this.y, this.width, this.height);
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
class Bullet {
    constructor(x, y, width, height, velocity) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = velocity;
    }
    draw() {
        tool.fillStyle = "white";
        tool.fillRect(this.x, this.y, this.width, this.height)
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Planet {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

    }
    draw() {
        //draw krenge 
        tool.drawImage(earthImg, this.x, this.y, this.width, this.height);
    }

}

class Particle {
    constructor(x, y, radius, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        tool.save();
        tool.globalAlpha = this.alpha;
        tool.beginPath();
        tool.fillStyle = "white";
        tool.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        tool.fill();
        tool.restore();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

let bullets = [

];

let coronas = [

];

let particles = [

];



let animId;
function animate() {
    tool.clearRect(0, 0, canvas.width, canvas.height);
    tool.fillRect(0, 0, canvas.width, canvas.height);
    //space draw
    tool.drawImage(spaceImg, 0, 0, canvas.width, canvas.height);

    let earth = new Planet(ePosX, ePosY, eWidth, eheight);
    earth.draw();
    //particle update
    particles.forEach(function (particle, index) {
        if( particle.alpha<=0){
         setTimeout(function(){
            particles.splice(index,1);
         },0);
        }
       else{
        particle.update();
       }
    })

    // for updating bullets
    let blength = bullets.length

    for (let i = 0; i < blength; i++) {
        bullets[i].update();
        if (bullets[i].x < 0 || bullets[i].y < 0 || bullets[i].x > canvas.width || bullets[i].y > canvas.height) {
            setTimeout(function () {
                bullets.splice(i, 1);
            })

        }
    }

    // for  corona

    coronas.forEach(function(corona, i){
        corona.update();
        // collison code  with earth
        let enemy = corona;
        if (colRec(earth, enemy)) {
            fullpower-=10;
            powerlevel.style.width =`${fullpower}%`;
            coronas.splice(i,1);
            if(fullpower==0){
                cancelAnimationFrame(animId);
               // alert("Game Over");
               restart();
            }
        
        }
        // collison of bullet and corona
        bullets.forEach(function (bullet, bulletidx) {
            if (colRec(enemy, bullet)) {
                //explosion
                for (let i = 0; i < enemy.width * 4; i++) {
                    particles.push(new Particle(bullet.x, bullet.y, Math.random() * 2, {
                        x: (Math.random() - 0.5) * (Math.random() * 5),
                        y: (Math.random() - 0.5) * (Math.random() * 5)
                    }))
                }

                setTimeout(() => {
                    coronas.splice(i, 1);
                    bullets.splice(bulletidx, 1);
                    score++;
                    scoreElemrnt.innerText= score;
                }, 0)
            }
        })
    })
   
    animId = requestAnimationFrame(animate);
}
function createCorona() {
    setInterval(function () {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let delta = Math.random();
        if (delta < 0.5) {
            //horizontal
            x = Math.random()< 0.5 ? 0 : canvas.width;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 : canvas.height;
         
        }
        let angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        let velocity = {
            x: Math.cos(angle) * 1.5,
            y: Math.sin(angle) * 1.5
        }
        let corona = new Corona(x, y, 40, 40, velocity);
        coronas.push(corona);
    }, 1000)
}
startBtn.addEventListener("click", function (e) {
    e.stopImmediatePropagation();
    //box ko hide
    box.style.display = "none";
    //space load kro

    animate();

    createCorona();

    window.addEventListener("click", function (e) {
        console.log(e);
        let angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2);
        let velocity = {
            x: Math.cos(angle) * 3,
            y: Math.sin(angle) * 3,
        }
        let bullet = new Bullet(canvas.width / 2, canvas.height / 2, 7, 7, velocity);
        bullet.draw();
        bullets.push(bullet);

    })

})

function colRec(entity1, entity2) {
    let l1 = entity1.x;
    let l2 = entity2.x;
    let r1 = entity1.x + entity1.width;
    let r2 = entity2.x + entity2.width;
    let t1 = entity1.y + entity1.height;
    let t2 = entity2.y + entity2.height;
    let b1 = entity1.y;
    let b2 = entity2.y;
    if (l1 < r2 && l2 < r1 && t1 > b2 && t2 > b1) {
        return true;
    }
    return false;
}

window.addEventListener("resize",function(){
    window.location.reload();
})
function restart(){
    restartBtn.style.display="block";
    startBtn.style.display="none";
    box.style.display="flex";
    powerlevel.parentElement.style.display="none";
    document.body.style.backgroundColor ="white";
    canvas.height="0px";
    restartBtn.addEventListener("click",function(){
        window.location.reload();
    })

}