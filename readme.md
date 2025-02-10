## numscript-template-literal

> Just a POC, please don't actually use that

When you have a lot of variables in numscript programs, it may be annoying to create the necessary boilerplate (declare each variable and then making sure you pass each of those value to the variables)

This tiny utility allows you to pass variable directly though string interpolation, and generate vars block automatically:

```ts
import * as numscript from "numscript-template-literal";

// data is validated so that you cannot create e.g. invalid usernames
const user1 = numscript.account("user:001"),
  user2 = numscript.account("bank"),
  amount = numscript.number(42n);

// I can interpolate directly in the script
const script = numscript.lit`
send [USD/2 ${amount}] (
  source = @world
  destination = ${user1}
)

send [USD/2 ${amount}] (
  source = ${user2}
  destination = @world
)
`;

// but this will result in a numscript template
// that you can pass to the Formance SDK
expect(script).toEqual({
  vars: {
    autogen__number1: "42",
    autogen__account1: "user:001",
    autogen__account2: "bank",
  },
  plain: `vars {
  number $autogen__number1
  account $autogen__account1
  account $autogen__account2
}

send [USD/2 $autogen__number1] (
  source = @world
  destination = $autogen__account1
)

send [USD/2 $autogen__number1] (
  source = $autogen__account2
  destination = @world
)
`,
});
```
