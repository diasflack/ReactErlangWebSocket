-module(react_message_websocket, [Req, SessionId]).

-behaviour(boss_service_handler).

-record(state,{users}).

-compile(export_all).

init() ->
   io:format("~p (~p) starting...~n", [?MODULE, self()]),
    {ok, #state{users=dict:new()}}.

handle_join(ServiceURL, WebSocket, State) ->
    #state{users=Users} = State,
    io:format("Join -- URL:~p, Socket:~p, State:~p ~n",[ServiceURL, WebSocket, State]),
    {noreply, #state{users=dict:store(WebSocket, SessionId ,Users)}}.

handle_close(Reason, ServiceURL, WebSocket, State) ->
    #state{users=Users} = State,
    io:format("Close -- Reason:~p, URL:~p, Socket:~p, State:~p ~n",[Reason, ServiceURL, WebSocket, State]),
    {noreply, #state{users=dict:erase(WebSocket,Users)}}.

handle_broadcast(Message, State) ->
    io:format("Broadcast -- Broadcast Message ~p~n",[Message]),
    {noreply, State}.

handle_incoming(_ServiceName, WebSocket, Message, State) ->
    io:format("Incoming -- _ServiceName:~p, Socket:~p, Message:~p ~n",[_ServiceName, WebSocket, Message]),
    Mess = jsx:decode(Message),
    Ans = [{<<"data">>, [[{<<"author">> , <<"vasya">>}, {<<"text">>, <<"This is one comment">>}]]}, {<<"$type">>, <<"dataCompleted">>}],

    Id = lists:keyfind(<<"$id">>, 1, Mess),

    Answer = lists:merge(Ans, [Id]),

    io:format("Mess -- :~p~n,",[Mess]),
    io:format("Answer -- :~p~n,",[Answer]),

    WebSocket ! {text, jsx:encode(Answer)},

    {noreply, State}.

handle_info(ping, State) ->
    error_logger:info_msg("pong:~p~n", [now()]),
    {noreply, State};

handle_info(state, State) ->
    #state{users=Users} = State,
    All = dict:fetch_keys(Users),
    error_logger:info_msg("state:~p~n", [All]),
    {noreply, State};

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    ok.