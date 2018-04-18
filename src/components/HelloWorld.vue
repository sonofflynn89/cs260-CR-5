<template>
  <div>
       <div v-if="!loggedIn" class="mainContainer">
       <h1 id="welcomeHeader"> Missionary Journal </h1>
       <div id="scripture">
       <p>"And I also command you that ye keep a record of this people" </p>
       <p> - Alma 37:2 </p>
       </div>
      <div id="registerForm"> 
      <form v-on:submit.prevent="register">
      <p> Create an account.</p>
      <input  v-model="name" placeholder="First and Last Name"><br/>
      <input  v-model="email" placeholder="Email Address"> <br/>
      <input  type="password" v-model="password" placeholder="Password"> <br/>
      <button type="submit">Register</button>
    </form>
    <form v-on:submit.prevent="login">
      <p> Login </p>
      <input v-model="loginEmail" placeholder="Email Address"><br/>
      <input type="password" v-model="loginPassword" placeholder="Password"> <br/>
      <button type="submit"> Login </button>
      <p v-if="loginError">{{loginError}}</p>
    </form> 
    </div>
    </div>
    <div v-else>
      <journal-log/>
    </div>
  </div>
</template>

<script>
import JournalLog from './JournalLog';
import axios from 'axios';

export default {
  name: 'HelloWorld',
  components: {JournalLog},
  data () {
    return {
     name: '',
     email: '',
     password: '',
     loginEmail: '',
     loginPassword: '',
    }
  },
  computed: {
     user: function() {
       return this.$store.getters.user;
     },
     loggedIn: function() {
       return this.$store.getters.loggedIn;
     },
     loginError: function() {
       return this.$store.getters.loginError;
     },
   },
   methods: {
     register: function() {
       this.$store.dispatch('register',{
	 email: this.email,
         password: this.password,
	 name: this.name,
       });
     },
     login: function() {
       this.$store.dispatch('login',{
         email: this.email,
         password: this.password,
       }).then(user => {
	 this.email = '';
	 this.password = '';
       });
     },


   }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .mainContainer {
    display: grid;
    grid-template-columns: 33% 33% 33%;
    grid-template-rows: 33% 33% 33%;
    background-image: url("../../static/images/scriptures.jpg");
    height: 900px;
    background-color: rgba(0, 0, 0, 0.3);
  }

#welcomeHeader {
   grid-column: 1 / 4;
   font-size: 50px;
   background-color: rgba(0, 0, 0, 0.5);
   color: white;
}
#scripture {
grid-row: 3 / 4;
grid-column: 1/4;
background-color: rgba(0, 0, 0, 0.3);
color: white;
}
#registerForm {
grid-row: 2 /3;
grid-column: 2/3;
}
</style>
