using System;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json;
using System.Collections.Generic;
namespace simulator
{
    class Program
    {
        static void Main(string[] args)
        {
            List<Task> tasks = new List<Task>();
            for(var i = 0; i < 100; i ++){
                Task task = new Task( () => {
                                                var executer = new SimulationExecuter();
                                                executer.Simulate("34.80.239.146","http://35.188.137.20","FrequentUser");
                                            });
                task.Start();
                tasks.Add(task);
            }

            Task.WaitAll(tasks.ToArray());
        }
    }
}
