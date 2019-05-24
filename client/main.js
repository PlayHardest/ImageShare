import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Session} from 'meteor/session';
import {Accounts} from  'meteor/accounts-base';

import './main.html';
import '../lib/collections.js'

var MouseOver;
//var imgLimit;
Session.set('imgLimit', 3);
Session.set('usershow', false);

Accounts.ui.config({
	passwordSignupFields: 'USERNAME_ONLY',
});

Template.footerBar.helpers({
	imagecount(){
		return imagesDB.find({}).count();
	}
})

Template.mainBody.helpers({
	imageAll(){
		var prevTime = new Date() - 15000;
		if(Session.get('usershow')){
			return imagesDB.find({PostedBy:Session.get('usershow')});
		}
		else{
			var newResults = imagesDB.find({createdOn:{$gte:prevTime}}).count();
			if (newResults>0){
				return imagesDB.find({}, {sort:{createdOn:-1,Rating: -1},limit:Session.get('imgLimit')});
			} else {
				return imagesDB.find({}, {sort:{Rating: -1,createdOn:-1},limit:Session.get('imgLimit')});
			}
		}
	},
	searching(){
		if(Session.get('usershow')){
			return true;
		}
	},
	userCheck(){
		var authority = this.PostedBy;
		if(Meteor.user()){
			if(authority == Meteor.user()._id){
				return true;
			}	
		}
	},

	userName(){
		var uId = imagesDB.findOne({_id:this._id}).PostedBy;
		return Meteor.users.findOne({_id:uId}).username;
	}

})


Template.mainBody.events({
	'click .addnewimage'(event){
		if(!Session.get('usershow'))
			$('#addimage').modal('show');
	},
	'click .js-delete'(event){
		var imgID = this._id;
		$("#" + imgID).fadeOut("slow","swing",function(){
			imagesDB.remove({_id:imgID}); 	
		});
	},
	'click .js-edit'(Event){
		var modalname = "#editimage" + this._id;
		$(modalname).modal('show');
		console.log(modalname);
	},
	'click .js-saveimg'(event){
		var modalname = "#editimage" + this._id;
		var imgID = this._id;
		var title = $(modalname + ' input [name="etitlePath"]').val();
		var img = $(modalname + ' input [name="eimagePath"]').val();
		var desc = $(modalname + ' input [name="edescriptionPath"]').val();
		$(modalname + ' input [name="etitlePath"]').val('');
		$(modalname + ' input [name="eimagePath"]').val('');
		$(modalname + ' input [name="edescriptionPath"]').val('');

		if(title == undefined || title ==""){
			console.log("title changed");
			title = this.Title;
		}
		if(img == undefined || img ==""){
			console.log("img changed");
			img = this.image;
		}
		if(desc == undefined || desc ==""){
			console.log("desc changed");
			desc = this.description;
		}
		// console.log(title,img,desc);
		imagesDB.update({"_id":imgID}, {$set:{'Title':title, 'image':img, 'description':desc}});
		// console.log(this.Title, this.image, this.description);
		$(modalname).modal('hide');
	},
	'click .js-userShow'(event){
		event.preventDefault();
		Session.set('usershow',this.PostedBy);
	},

	'click .js-searchEnd'(event){
		Session.set('usershow',false);	
	},
	
	'click .js-rate'(Event,instance){
		var imgID =this.data_id;
		var rating = $('#rating').data('userrating');
		imagesDB.update({"_id":imgID}, {$set:{'Rating':rating}});
		console.log("user ",imgID," has ",rating," stars");
	},
});



Template.addModal.events({
	'click .addimage'(event, instance){
		var title = $('#titlePath').val();
		var img = $('#imagePath').val();
		var desc = $('#descriptionPath').val();

		$('#titlePath').val('');
		$('#imagePath').val('');
		$('#descriptionPath').val('');
		$('#addimage').modal('hide');
		imagesDB.insert({'Title':title, 'image':img, 'description':desc, "createdOn":new Date().getTime(), 'Rating':0, 'PostedBy':Meteor.user()._id});
	},

	'input #imagePath'(event){
		var imgpath = $('#imagePath').val();
		$("#addImgPreview").attr('src',imgpath);
	}
})

lastScrollTop =0;
$(window).scroll(function(Event){
	if($(window).scrollTop() + $(window).height() > $(document).height()-100){
		var scrollTop = $(this).scrollTop();
		if(scrollTop>lastScrollTop){
			console.log("We have arrived at the bottom of the page");
			Session.set('imgLimit', Session.get('imgLimit')+3);
		}
		lastScrollTop=scrollTop;
	}
});