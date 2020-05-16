using System.Net.WebSockets;
using System;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
namespace simulator{
    public class Simulator{
        private ClientWebSocket _ws = null;
        private string _host = null;    
        public Simulator(string host){
            _ws = new ClientWebSocket();
            _host = host;
        }
        public async Task ConnectAsync(){
            await _ws.ConnectAsync(new Uri($"ws://{this._host}"), CancellationToken.None);
        }

        public async Task CloseAsync(){
            await _ws.CloseAsync(WebSocketCloseStatus.NormalClosure,"ok", CancellationToken.None);
        }
        public async Task<string> ReceiveAsync(){
            var result = new ArraySegment<byte>(new byte[1024]);
            await _ws.ReceiveAsync(result, CancellationToken.None);
            var text = Encoding.UTF8.GetString(result.ToArray());
            Console.WriteLine(text);
            return text;
        }
        public async Task<string> Do(string cmd, bool expectReturns = true){
            Console.WriteLine(cmd);
            var buffer = new System.ReadOnlyMemory<byte>(Encoding.UTF8.GetBytes(cmd));
            await _ws.SendAsync(buffer,WebSocketMessageType.Text, true, CancellationToken.None);
            var result = new ArraySegment<byte>(new byte[1024]);
            WebSocketReceiveResult resp = null;

            do
            {
                resp = await _ws.ReceiveAsync(result, CancellationToken.None);
                Task.Delay(1000);
            }
            while(expectReturns && resp.Count == 0);

            Console.WriteLine(resp.Count);
            var text = Encoding.UTF8.GetString(result.ToArray());
            Console.WriteLine(text);
            return text;
        }
    }
}