using DotnetExample;
using Amazon.CDK;
using Amazon.CDK.IntegTests.Alpha;
using System;

namespace DotnetExample.Tests
{
    sealed class IntegTestExampleOne
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("IntegTestExampleOne");

            App app = new App();
            Stack stack = new DotnetExampleStack(app, "ExampleStack", new StackProps{});

            new IntegTest(app, "IntegTestOne", new IntegTestProps{
                TestCases = new [] { stack }
            });

            app.Synth();
        }
    }
}