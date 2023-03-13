using DotnetExample;
using Amazon.CDK;
using Amazon.CDK.IntegTests.Alpha;
using System;

namespace DotnetExample.Tests
{
    sealed class IntegTestExampleTwo
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("IntegTestExampleTwo");

            App app = new App();
            Stack stack = new DotnetExampleStack(app, "ExampleStack", new StackProps{});

            new IntegTest(app, "IntegTestTwo", new IntegTestProps{
                TestCases = new [] { stack }
            });

            app.Synth();
        }
    }
}