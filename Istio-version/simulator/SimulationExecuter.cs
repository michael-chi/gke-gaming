using System.Net.WebSockets;
using System;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Http;
using System.Net.Http.Headers;
using System;
using System.Text.Json;
using System.Linq;
namespace simulator{
    public class SimulationExecuter{
        private string [] WEAPONS = new string [] {"5c1e498d-2ec8-45bb-a39d-1bed664475f2",
                                "b673976d-1e6a-429d-a6ca-7ff59e4a4d89",
                                "bacb210f-e3e6-4e10-94a0-24791e72c994",
                                "bc8c6130-2c60-485d-911f-7019107e2e7c",
                                "e122d613-0134-4429-85cc-6846b6fb08ac"};
        private string [] POTIONS = new string []{"4748012b-1e1c-4b68-8d08-0dc2275ba6b9",
                                    "ec042a05-05bb-4fe4-9041-bc7cf2cf2b1b"};
        private void Debug(string msg){
            Console.WriteLine($"[{DateTime.Now}]{msg}");
        }
        Random random = new Random();
        private Simulator _simulator = null;

        string FindVictim(){
            string text = "";
            try{
                text = _simulator.Do("list").Result;
                Debug($"list={text}");
                var who = JsonSerializer.Deserialize<string[]>(text);
                
                var victim = who[random.Next(0, who.Length)];
                Debug($"victim={victim}");

                return victim;
            }catch(Exception ex){
                Debug($"FindVictim Exception:text={text}");
                Debug($"FindVictim Exception:Exception={ex.Message}");
                throw ex;
            }
        }
        void Buy(PlayerInfo info, double chance){
            if(random.NextDouble() >= chance){
                if(info.tags.Contains("BuyPotion")){
                    var potion = POTIONS[random.Next(0, POTIONS.Length - 1)];
                    Debug($"shop buy {potion} 1");
                    _simulator.Do($"shop buy {potion} 1").Wait();
                }else{
                    var weapon = WEAPONS[random.Next(0, WEAPONS.Length - 1)];
                    Debug($"shop buy {weapon} 1");
                    _simulator.Do($"shop buy {weapon} 1").Wait();
                }
            }
        }
        bool NextAction(PlayerInfo info){
            if( (info.tags.Contains("Killer") && random.NextDouble() <= 0.8) || (random.NextDouble() >= 0.9) ){
                var victim = FindVictim();
                 _simulator.Do($"attack {victim}").Wait();

                 return true;
            }else if(info.tags.Contains("Buyer") || info.tags.Contains("SuperBuyer") || (random.NextDouble() <= 0.7)){
                _simulator.Do("shop list").Wait();

                Task.Delay(random.Next(2,10) * 1000);

                if(info.tags.Contains("Buyer")){
                    Buy(info, 0.5);
                }
                if(info.tags.Contains("SuperBuyer")){
                    Buy(info, 0.3);
                }
                return true;
            }else if((random.NextDouble() >= 0.6)){
                _simulator.Do("look").Wait();
                return true;
            }else if((random.NextDouble() >= 0.5)){
                _simulator.Do("stat").Wait();
                return true;
            }else if(random.NextDouble() >= 0.98){
                _simulator.Do("quit").Wait();
                return false;
            }else{
                _simulator.Do("look").Wait();
                return true;
            }
        }
        public void Simulate(string host, string dataApi, string tag)
        {
            //_simulator = new Simulator("34.80.239.146","http://35.188.137.20","FrequentUser");
            Task.Delay(random.Next(1,3)).Wait();
            _simulator = new Simulator(host,dataApi,tag);
            var text = _simulator.GetPlayerAsync().Result;
            var o = JsonSerializer.Deserialize<ApiResult>(text);
            
            _simulator.ConnectAsync().Wait();
            _simulator.ReceiveAsync().Wait();

            _simulator.Do($"login {o.data.playerId}").Wait();
            _simulator.Do("look").Wait();

            while(NextAction(o.data)){
                var wait = random.Next(3, 10) * 1000;
                Debug($"Wait for {wait} ms");
                Task.Delay(wait).Wait();
            }
            
        }
    }
}