using System.Net.WebSockets;
using System;

namespace simulator{
    public class ApiResult{
        public string status{get;set;}
        public PlayerInfo data{get;set;}
    }
    public class PlayerInfo{
        public string playerId{get;set;}
        public string []tags{get;set;}
    }
}