var socketService = new SocketService();

var CommentBox = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    requestComments: function() {
        this.setState({data: []});
        var socket = this.props.socketService;
        socket.sendRequest({$type: 'commentsRequested'}, function (message) {
            if (message.$type === 'dataReceived') {
                if (!message.data) return;
                this.state.data.push(message.data);
            }
            if (message.$type === 'dataCompleted') {
                socket.requestComplete(message.$id);
                this.setState({data: message.data});
            }
            if (message.$type === 'error') {
                socket.requestComplete(message.$id);
            }
        }.bind(this));
      },
    handleCommentSubmit: function(comment) {
        var comments = this.state.data;
        comments.push(comment);
        this.setState({data: comments});
        console.log('TODO - submit comment');
    },
    componentWillMount: function () {
    	this.requestComments();
    },
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <input type="submit" value="Refresh" onClick={this.requestComments} />
                <CommentList data={this.state.data} />
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
        );
    }
});

var CommentList = React.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function (comment) {
          return (
            <Comment author={comment.author}>
              {comment.text}
            </Comment>
          );
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        )
    }
});

var CommentForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();
        var author = React.findDOMNode(this.refs.author).value.trim();
        var text = React.findDOMNode(this.refs.text).value.trim();
        if (!text || !author) {
          return;
        }
        this.props.onCommentSubmit({author: author, text: text});
        React.findDOMNode(this.refs.author).value = '';
        React.findDOMNode(this.refs.text).value = '';
        return;
      },
    render: function() {
        return (
              <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Your name" ref="author" />
                <input type="text" placeholder="Say something..." ref="text" />
                <input type="submit" value="Post" />
              </form>
        )
    }
});


var converter = new Showdown.converter();

var Comment = React.createClass({
    render: function() {
        var rawMarkup = converter.makeHtml(this.props.children.toString());
        return (
            <div className="comment">
                <h2 className="commentAuthor">
                    {this.props.author}
                </h2>
                <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
            </div>
        )
    }
});

React.render(
    <CommentBox socketService={socketService} />,
    document.body
);
