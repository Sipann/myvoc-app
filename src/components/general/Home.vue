<template lang="html">

      <div class="main-div">
        <div class="word" v-for="word in words">
          <p>{{word[0]}}</p>
          <p>{{word[1]}}</p>
        </div>


        <v-card class="myvoc" width="30rem" height="20rem">
          <v-card-text class="card-text">
            <div class="card-content" :class="{ done: animCompleted }">
              <div class="spanM" ref="spanM"><p>M</p></div>
              <div class="spanY" ref="spanY"><p>Y</p></div>
              <div class="spanV" ref="spanV"><p>V</p></div>
              <div class="spanO" ref="spanO"><p>O</p></div>
              <div class="spanC" ref="spanC"><p>C</p></div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" flat to="/demo">Show Me a Demo</v-btn>
            <v-btn color="primary" flat to="/dashboard">Go to My Dashboard</v-btn>
          </v-card-actions>
        </v-card>

      </div>

  </template>

  <script>

    import { homeAnimation } from '@/assets/anim-home';

    export default {
      name: 'home',


      data() {
        return {
          words: [
            ['amusant', 'fun'],
            ['goal', 'objectif'],
            ['apprendre', 'learn'],
            ['practice', "s'entraîner"],
            ['game', 'jeu'],
            ['world', 'monde'],
            ['couramment', 'fluently'],
            ['effortless', 'sans effort'],
            ['volonté', 'willpower'],
            ['memorize', 'mémoriser'],
            ['speak', 'parler'],
            ['leisure', 'loisir'],
            ['audace', 'daring'],
          ],
          animCompleted: false,
        }
      },

      mounted() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        let words = document.querySelectorAll('.main-div .word');

        for (let i=0; i<words.length; i++) {
          let transitionX = Math.floor(Math.random() * 25);
          let transitionY = Math.floor(Math.random() * 25);
          let animationTime = Math.max(Math.random() * 12, 12);
          words[i].style.setProperty('--transitionx1', `${transitionX}px`);
          words[i].style.setProperty('--transitiony1', `${transitionY}px`);
          words[i].style.setProperty('--animation-time', `${animationTime}s`);
        }

        let vm = this;
        homeAnimation(this.$refs.spanM, this.$refs.spanY, this.$refs.spanV, this.$refs.spanO, this.$refs.spanC, vm);

      },

      watch: {
        animCompleted: function(value) {
          if (value === true) {
            console.log('animCompleted now true');
            this.backgroundLogo();
          }
        }
      },

      methods: {

        backgroundLogo() {
          if (this.animCompleted === true) {
            console.log('this.animCompleted === true');
            return `background-clip: text;
            -webkit-background-clip: text;
            background-image: url('../../assets/background2.png');
            color: transparent;
            -webkit-text-stroke-width: 4px;
            -webkit-text-stroke-color: #000;`;
          }
        }

      },


    }

  </script>

  <style lang="css" scoped>

body {
  margin: 0;
  padding: 0;
}

/* STYLING BACKGROUND */

:root {
  --animation-time: 5s;
  --transitionx1: 1rem;
  --transitiony1: 1rem;
}

.main-div {
  width: 100vw;
  height: 100vh;
  background: #333;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-div .word {
  /* background: yellow; */
  width: 10rem;
  height: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  padding: 1rem;

  animation: floating var(--animation-time) alternate infinite;
  transform: translate3d(var(--transitionx1), var(--transitiony1), 0);
}

.main-div .word p {
  color: #ccc;
  font-size: 1.7rem;
  transition: opacity 1s;
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
}

.main-div .word p:last-child {
  opacity: 0;
  font-weight: bold;
  font-size: 2rem;
}

.main-div .word:hover p:first-child {
  opacity: 0;
}

.main-div .word:hover p:last-child {
  opacity: 1;
}


@keyframes floating {
  100% { transform: translate3d(0, 0, 0); }
}

.main-div .word:first-child {
  top: 2rem;
  left: 2rem;
}

.main-div .word:nth-child(2) {
  top: 4rem;
  left: 18rem;
}

.main-div .word:nth-child(3) {
  top: 20rem;
  left: 4rem;
}

.main-div .word:nth-child(4) {
  top: 19rem;
  left: 25rem;
}

.main-div .word:nth-child(5) {
  top: 30rem;
  left: 22rem;
}

.main-div .word:nth-child(6) {
  top: 10rem;
  left: 35rem;
}

.main-div .word:nth-child(7) {
  top: 20rem;
  left: 42rem;
}

.main-div .word:nth-child(8) {
  top: 32rem;
  left: 45rem;
}

.main-div .word:nth-child(9) {
  top: 2rem;
  left: 55rem;
}

.main-div .word:nth-child(10) {
  top: 8rem;
  left: 70rem;
}

.main-div .word:nth-child(11) {
  top: 22rem;
  left: 50rem;
}

.main-div .word:nth-child(12) {
  top: 28rem;
  left: 68rem;
}

.main-div .word:nth-child(13) {
  top: 20rem;
  left: 63rem;
}

/* STYLING .myvoc */

@font-face {
    font-family: "RecipeDailyBold";
    src: url(../../assets/RecipeDaily-BOLD.otf) format("truetype");
}

.myvoc {
  position: relative;
  border-radius: 10px;
}

.card-content div {
  font-size: 9rem;
  font-family: 'RecipeDailyBold', sans-serif;
  color: #333;
}

/* @TODO => style rules ajoutées ici pour le background-clip: text
Si on retire cela => remettre cas 1 dans le html. */
.card-content.done div p {
  background-clip: text;
  -webkit-background-clip: text;
  background-image: url('../../assets/background2.png');
  color: transparent;
  -webkit-text-stroke-width: 4px;
  -webkit-text-stroke-color: #000;
  margin-bottom: 0;
}


.card-text {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ccc;
}

.myvoc div:nth-child(2),
.myvoc div:nth-child(4),
.myvoc div:nth-child(5) {
  font-size: 7rem;
  padding-top: 2.4rem;
}

.myvoc .card-content {
  width: 100px;
  height: 180px;
  position: relative;


}

.card-content div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  background: #ccc;
}

.spanY,
.spanV,
.spanO,
.spanC {
  opacity: 0;
}

  </style>
