(function ($, _, BB, BBM) {

	function timeSince (current, previous) {

		var msPerMinute = 60 * 1000;
	    var msPerHour = msPerMinute * 60;
	    var msPerDay = msPerHour * 24;
	    var msPerMonth = msPerDay * 30;
	    var msPerYear = msPerDay * 365;

	    var elapsed = current - previous;

	    console.log(elapsed)
	    console.log(arguments)

	    if (elapsed < msPerMinute) {
	         return Math.round(elapsed/1000) + ' seconds ago';   
	    }

	    else if (elapsed < msPerHour) {
	         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
	    }

	    else if (elapsed < msPerDay ) {
	         return Math.round(elapsed/msPerHour ) + ' hours ago';   
	    }

	    else if (elapsed < msPerMonth) {
	        return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';   
	    }

	    else if (elapsed < msPerYear) {
	        return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';   
	    }

	    else {
	        return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';   
	    }
		
	}

	var CommentModel = BB.Model.extend({
		defaults: {
			'author': '-',
			'message': '-',
			'upvotes': 0,
			'date_added': '-', 
			'time_elapsed': 0
		},

		idAttribute: '_id',

		initialize: function () {

		}, 

		url: function () {
			var location = 'http://localhost:9090/comments';
			return location + (this.get('_id') ? '/' + this.get('_id') : '');			
		}, 

		validate: function (attrs) {
			
		}, 

		comparator: 'date_added'
	});

	var CommentCollection = BB.Collection.extend({
		model: CommentModel,
		url: 'http://localhost:9090/comments', 
		checkData: function (personData, id) {
			if (_.contains(personData, '')) {
				alert('Error: Fields cannot be empty.');
				return;
			}

			var findContact = this.findWhere({username: personData.username});

			if (findContact) {
				if (id !== findContact.get('_id')) {
					alert('Error: Username already exists.');
					return;	
				}
			}
			return true;
		},
		updatePosition: function () {
			if (!this.length) return;
			var i = 0;
			_.each(this.models, function (model) {
				model.set({position: i += 1})
			});
		}
	});

	var CommentView = BBM.ItemView.extend({
		tagName: 'li',
		template: '#comment-template',

		events:  {
			'click .upvote'	: 'upvote',				
			'click .delete'	: 'deleteItem'
		},

		modelEvents: {
			'change': 'render'
		}, 

		upvote: function () {
			console.log('upvote')
			var vote = this.model.get('upvotes');
			console.log(Number(vote) + 1)
			this.model.set('upvotes', Number(vote) + 1).save();
			console.log(this.model)
		}, 

		deleteItem: function () {
			console.log('remove')
			console.log(this.model)
			this.model.destroy();
		}, 

		onRender: function () {
			var now = new Date();
			var date_added = new Date(this.model.get('date_added'));
			console.log('onrender')
			console.log(this.model.get('date_added'))
			console.log(now.getTime());
			console.log(date_added.getTime());
			this.model.set("time_elapsed", timeSince(now.getTime(), date_added.getTime()));
		}, 

		onBeforeRender: function () {

		}
	});

	var CompositeView = Backbone.Marionette.CompositeView.extend({

		template: '#comment-form',
		itemView: CommentView,
		itemViewContainer: 'ul',
		collection: new CommentCollection,
		ui: {
			add_comment: '#add_comment',
			author: 'input[name=author]',
			comment: '#comment_text'
		}, 

		events: {
			'click #add_comment': 'addComment', 
			'focus input': 'commentTextClicked'
		},
		// collectionEvents: {
		// 	'all': 	'render'
		// }, 

		initialize: function () {
			this.collection.fetch();
			this.bindUIElements();
		},

		addComment: function () {
			var addDate = new Date();

			this.collection.create({
				author: this.ui.author.val(),
				message: this.ui.comment.val(),
				upvotes: 1,
				date_added: addDate,
				time_elapsed: '2 seconds'
			});

			this.ui.author.val('');
			this.ui.comment.val('');

		},

		onBeforeItemAdded: function (itemView) {
			var itemModel = itemView.model;
			var dateAdded = new Date();
			itemModel.set("time_elapsed", timeSince(dateAdded.getTime(), dateAdded.getTime()));
		}, 
		onAfterItemAdded: function (itemView) {

		}, 
		onItemRemoved: function (itemView) {
			
		}, 

		commentTextClicked: function () {
			console.log('commentTextClicked')
		}, 


	});

	
	var commentApp = new CompositeView();

	$('#comment-section').html(commentApp.render().el);
	console.log(commentApp.render().el)
	console.log(commentApp)


})(jQuery, _, Backbone, Backbone.Marionette)