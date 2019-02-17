import anime from 'animejs';

function homeAnimation(spanM, spanY, spanV, spanO, spanC, vm) {
  let duration = 200;
  let offset = 4*duration;

  let homeTimeline = anime.timeline({
    easing: 'linear',
    autoplay: true,
  });

  homeTimeline.add({
    targets: spanY,
    opacity: 1,
    duration: duration,
  }).add({
    targets: spanV,
    opacity: 1,
    duration: duration,
  }).add({
    targets: spanO,
    opacity: 1,
    duration: duration,
  }).add({
    targets: spanC,
    opacity: 1,
    duration: duration,
  }).add({
    targets: spanM,
    translateX: '-9rem',
    duration: duration,
    offset: offset,
  }).add({
    targets: spanY,
    translateX: '-2.8rem',
    duration: duration,
    offset: offset,
  }).add({
    targets: spanV,
    translateX: '1.8rem',
    duration: duration,
    offset: offset,
  }).add({
    targets: spanO,
    translateX: '6.6rem',
    duration: duration,
    offset: offset,
  }).add({
    targets: spanC,
    translateX: '11rem',
    duration: duration,
    offset: offset,
    complete: function() {
      console.log('anim completed');
      vm.animCompleted = true;
    }
  });


}

export { homeAnimation }























//
