using System;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
namespace simulator
{
    class Program
    {
        static void Main(string[] args)
        {
            var s = new Simulator("34.80.239.146");
            s.ConnectAsync().Wait();
            s.ReceiveAsync().Wait();

            s.Do("login Buddy_Henderickson-dhPG8MJ0g6").Wait();
            s.Do("look").Wait();
            s.Do("quit", false).Wait();

        }
    }
}
