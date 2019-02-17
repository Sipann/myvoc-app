import anime from 'animejs';

let autoplay = false;

function animExplainProfile(profileBorder, cardInfo, selectHistory, arrowDown, graphHistory, vm) {


  let profileTimeline = anime.timeline({
    autoplay: autoplay,
    easing: 'linear',
  });

  profileTimeline
    .add({
      targets: profileBorder,
      strokeDashoffset: 0,
      duration: 1000,
    })
    .add({
      targets: [cardInfo, selectHistory, arrowDown, graphHistory],
      opacity: 1,
      duration: 1000,
    })
    .add({
      targets: profileBorder,
      strokeDashoffset: 1458,
      duration: 0,
      offset: 200,
    })

    .add({
      targets: [cardInfo, selectHistory, arrowDown, graphHistory],
      opacity: 0,
      duration: 0,
      offset: 200,
    })

    .add({
      // profileBorder is drawn.
      targets: profileBorder,
      strokeDashoffset: 0,
      duration: 2000,
      offset: 300,
      begin: function() { vm.explainingTextIndex = 1; },
    }).add({
      // cardInfo appears.
      targets: cardInfo,
      opacity: 1,
      duration: 1500,
      offset: 3500,
      begin: function() { vm.explainingTextIndex = 2; },
    }).add({
      // selectHistory && arrowDown appear.
      targets: [selectHistory, arrowDown],
      opacity: 1,
      duration: 1000,
      offset: 5500,
      begin: function() { vm.explainingTextIndex = 3; },
    }).add({
      // graphHistory appears.
      targets: graphHistory,
      opacity: 1,
      duration: 1000,
      offset: 7000,
      begin: function() { vm.explainingTextIndex = 4; },
      complete: function() {
        vm.isPlaying = false;
        vm.explainingTextIndex = 0;
      }
    });

    ;

  return profileTimeline;

}

export {
  animExplainProfile,
}



//
