# .NET C# Example for CDK

```console
cdk synth -q
dotnet test src/DotnetExample.Tests
```

## Integration Tests

```console
npx @aws-cdk/integ-runner@2 --directory="src/DotnetExample.Tests" --test-regex="^Integ.*\.cs" --app="dotnet run {filePath}"
```
