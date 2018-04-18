<template>
  <div>
     <div class="buttonContainer">
     <button id="logoutButton"@click="logout">Logout</button>
     </div>
     <div>
     <h1> Your Story </h1>
      <form v-on:submit.prevent="add">
	<textarea v-model="text" placeholder=""/><br/>
	<div class="buttonWrap">
	  <button class="primary" type="submit">Add</button>
	</div>
      </form>
    </div>
    <div v-for="item in feed" class="item">
      <p>Written <span class="time">{{item.created | since}}</span> ago</p>
      <p class="tweet">{{item.entry}}</p>
    </div>
  </div>
</template>

<script>
 import moment from 'moment';
 export default {
   name: 'JournalLog',
   data () {
     return {
       text: '',
     }
   },
   created: function() {
     this.$store.dispatch('getFeed');
   },
   filters: {
     since: function(datetime) {
       moment.locale('en', {
	 relativeTime: {
	   future: 'in %s',
	   past: '%s',
	   s:  'seconds',
	   ss: '%ss',
	   m:  '1m',
	   mm: '%dm',
	   h:  'h',
	   hh: '%dh',
	   d:  'd',
	   dd: '%dd',
	   M:  ' month',
	   MM: '%dM',
	   y:  'a year',
	   yy: '%dY'
	 }
       });
       return moment(datetime).fromNow();
     },
   },
   computed: {
     feed: function() {
       return this.$store.getters.feed;
     },
   },
   methods: {
     add: function() {
       this.$store.dispatch('addEntry',{
         entry: this.text,
       }).then(tweet => {
	 this.text = "";
       });
     },
     logout: function() {
       this.$store.dispatch('logout');
     }
   }
 }
</script>

<style scoped>
      .item {
    /* Add shadows to create the "card" effect */
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    transition: 0.3s;
}

.buttonContainer {
display: grid;
grid-template-columns: 5% 30% 30% 30% 5%;
}

#logoutButton {
grid-column: 5 / 6;
}
</style>