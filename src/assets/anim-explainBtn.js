import anime from 'animejs';

let easing = 'linear';
let duration = 400;

function pauseAnimBtn(arrow) {
  let anime_arrow = anime({
    targets: arrow,
    d: [
    { value: 'M 44.976,34.624 L 63.428572,49.6875 L 44.976,64.483'},
    ],
    duration: duration,
    easing: easing,
  });
}

function restartAnimBtn(arrow) {
  let anime_arrow = anime({
    targets: arrow,
    d: [
    { value: 'M 57.429 34.683394 L 57.429,49.923894000000004 L 57.429,64.71939400000001'},
    ],
    duration: duration,
    easing: easing,
  });
}





export {
  pauseAnimBtn,
  restartAnimBtn,
}


//
