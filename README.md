# Graphics

本项目基于nodejs+typescript+webpack，实现的环境linux18.04。

# get-started

本项目已经提前编译好了文件，编译结果为main.js，直接把index.html放入浏览器中即可查看效果。


# setup environment

## use script

本项目提供了安装环境的脚本setup.sh可以使用脚本一键安装，目前该脚本只能再linux下使用，windows请按照下面的步骤手动配置。

## setup mannually

### install nodejs

可以从官网进行下载

### install ts globally

```bash
sudo npm install -g typescript
```

### configure tsconfig.json

```json
{
    "compilerOptions": {
      "module": "commonjs",
      "target": "es5",
      "sourceMap": true
    },
    "exclude": [
      "node_modules"
    ]
}
```

### install webpack

```bash
npm install webpack webpack-cli webpack-dev-server --save-dev
npm install typescript ts-loader --save-dev
npm init -y
```

### configure webpack config file

```js
const path = require('path');

module.exports = {
    entry: path.join(__dirname, '/main.ts'),
    output: {
        filename: 'main.js',
        path: __dirname
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
};
```

# compile

```bash
npm start
```

编译的结果为main.js。


# file structre

```yaml
- assets # 包含了结果的截图
- src # 源代码目录
  - MyWebGL # 自己封装的webgl简易框架方便使用
    - core # webgl核心实现
      - glsl/parameter # 对glsl一些内容进行封装，目前只封装了uniform和attribute变量
        - GlslAttribute.ts
        - GlslUniform.ts
      - transform # 对坐标变换进行了封装
        - ModelView.ts # 模视变换矩阵，lookat
        - Projection.ts # 投影矩阵，ortho，perspective等
        - Transform.ts # 常见变换，旋转，平移等
      - MyWebGl.ts # webgl绘制过程封装
      - RenderObject.ts # 绘制模型的封装
    - MathLib # 实现的向量，矩阵等数学运算的库
      - MathLib.ts # 实现了一些数学函数
      - Vector.ts # 向量的封装，实现了向量的基本运算
      - Matric # 矩阵的封装，实现了矩阵的基本运算
  - pentagram.ts # 五角星
  - color_cube.ts # 旋转的正方体
  - sphere.ts # 球
  - three_object.ts # 第三次作业
  - main.ts # 调用了上面四个脚本
- index.html # 展示的html
- main.js # 利用webpack编译好的js文件
- package.json # npm的包文件
- package-lock.json
- tsconfig.json # typesctipt配置文件
- webpack.config.js # webpack配置文件
```


# usage

使用该框架绘制物体的一般流程。

```typescript
// 实例化一个RenderObject对象
let renderObj = new RenderObject();

// 实例化一个MyWebGL对象
let myWebGL = new MyWebGL();

// 调用myWebGL的render()方法进行绘制
myWebGL.render(renderObj);
```

[RenderObject](#renderobject)的参数

[MyWebGL](#MyWebGL)的参数


# package reference(待补充)

## RenderObject

### parameter

* vsSource: string # 顶点着色器代码
* fsSource: string # 片元着色器代码
* mode: number # 图元类型
* count: number # 图元数量
* attributes: Map<string, GlslAttribute> # 着色器代码attribute类型变量
* uniforms: Map<string, GlslUniform> # 着色器代码uniform类型变量

### method

* updateUniform(name: string, val: any): void


## MyWebGL

### parameter

* canvasId: string # html中canvas的id
* contextId: string # webgl cnotext的类型，目前只支持'webgl'

### method

* render(renderObj: RenderObject): void

