import anime from 'animejs';

let autoplay = false;

function animExplainVoclist(voclistBorder, listWords, filterBox, lineWord, editBox, deleteBox, checkBox, updateBox, vm) {

  let voclistTimeline = anime.timeline({
    autoplay: autoplay,
    easing: 'linear',
  });

  voclistTimeline
    .add({
      targets: voclistBorder,
      strokeDashoffset: 0,
      duration: 1000,
    })
    .add({
      targets: [filterBox, lineWord, editBox, deleteBox, checkBox, updateBox],
      opacity: 1,
      duration: 1000,
    })
    .add({
      targets: [filterBox, lineWord, editBox, deleteBox, checkBox, updateBox],
      opacity: 0,
      duration: 0,
      offset: 2000,
    })
    .add({
      targets: voclistBorder,
      strokeDashoffset: 1458,
      duration: 0,
      offset: 2000,
    })


    .add({
      // dashBoardBorder is drawn.
      targets: voclistBorder,
      strokeDashoffset: 0,
      duration: 2000,
      offset: 300,
      begin: function() { vm.explainingTextIndex = 1; },
    }).add({
      // listWords is drawn
      targets: listWords,
      strokeDashoffset: 0,
      duration: 1000,
      offset: 2500,
      begin: function() { vm.explainingTextIndex = 2; },
    }).add({
      // filterBox appears
      targets: filterBox,
      opacity: 1,
      duration: 1000,
      offset: 3500,
      begin: function() { vm.explainingTextIndex = 3; },
    }).add({
      // listWords disappears
      targets: listWords,
      strokeDashoffset: 864.6,
      duration: 0,
      offset: 4500,
    }).add({
      // lineWord && editBox appear
      targets: [lineWord, editBox],
      opacity: 1,
      duration: 1000,
      offset: 5500,
      begin: function() { vm.explainingTextList = 4; },
    }).add({
      targets: deleteBox,
      opacity: 1,
      duration: 1000,
      offset: 6500,
      begin: function() { vm.explainingTextIndex = 5; },
    }).add({
      targets: checkBox,
      opacity: 1,
      duration: 1000,
      offset: 7500,
      begin: function() { vm.explainingTextIndex = 6; },
    }).add({
      targets: updateBox,
      opacity: 1,
      duration: 1000,
      offset: 8500,
      begin: function() { vm.explainingTextIndex = 7; },
      complete: function() {
        console.log('anim completed');
        vm.isPlaying = false;
        vm.explainingTextIndex = 0;
      }
    });

    return voclistTimeline;

}



export {
  animExplainVoclist,
}



//
