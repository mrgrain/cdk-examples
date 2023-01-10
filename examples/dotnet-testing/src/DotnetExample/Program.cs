using Amazon.CDK;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DotnetExample
{
    sealed class Program
    {
        public static void Main(string[] args)
        {
            var app = new App();
            new DotnetExampleStack(app, "DotnetExampleStack", new StackProps{});
            
            app.Synth();
        }
    }
}
