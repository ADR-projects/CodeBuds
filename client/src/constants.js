export const LANGUAGE_VERSIONS = {
  c: "10.2.0",
  cpp: "10.2.0",
  java: "15.0.2",
  python: "3.10.0",
  csharp: "6.12.0",
  rust: "1.68.2",
  javascript: "18.15.0",
  typescript: "5.0.3",
  ruby: "3.0.1",
  go: "1.16.2",
  php: "8.2.3",
};

export const LANGUAGE_RUNTIMES = {
  c: "gcc",
  cpp: "gcc",
  java: "jvm",
  python: "python",
  csharp: "mono",
  rust: "cargo",
  javascript: "node",
  typescript: "ts-node",
  ruby: "ruby",
  go: "go",
  php: "php",
};

export const CODE_SNIPPETS = {
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
`,

  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,

  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`,

  python: `def greet(name):
    print("Hello, " + name)

greet("ADR")
`,

  csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}
`,
  rust: `struct User {
    name: String,
    age: u32,
}

fn greet(user: &User) {
    println!("Hello, {}! You are {} years old.", user.name, user.age);
}

fn main() {
    let user = User {
        name: String::from("ADR"),
        age: 20,
    };

    greet(&user);
}
`,


  javascript: `function greet(name) {
    console.log("Hello, " + name);
}

greet("ADR");
`,
  typescript: `type User = {
  name: string;
  age: number;
};

function greet(user: User): void {
  console.log(\`Hello, \${user.name}! You are \${user.age} years old.\`);
}

greet({ name: "ADR", age: 20 });
`,


  ruby: `def greet(name)
  puts "Hello, #{name}"
end

greet("ADR")
`,

  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
`,

  php: `<?php

$name = "ADR";
echo "Hello, " . $name;
`,
};
