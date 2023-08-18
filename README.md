# 10cc

```sh
10cc % npm run dev 123

> 10cc@1.0.0 dev
> ts-node src/main.ts 123

Assemblyコードが tmp.s に書き込まれました。

10cc % docker exec -it 10cc bash

ser@aecd38ad92f3:~/10cc$ cc -o tmp tmp.s
user@aecd38ad92f3:~/10cc$ ./tmp
user@aecd38ad92f3:~/10cc$ echo $?
123
```
