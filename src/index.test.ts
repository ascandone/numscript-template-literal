import { test, expect, describe } from "vitest";
import * as numscript from "./index";

describe.todo("value validation");

test("interpolate vars (without duplicating values)", () => {
  const user1 = numscript.account("user:001"),
    user2 = numscript.account("bank"),
    amount = numscript.number(42n);

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

  expect(script).toEqual<numscript.Script>({
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
});

test.todo("works when there is already a vars block");
test.todo("doesn't declare already existing variables");
