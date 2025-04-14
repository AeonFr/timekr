# timekr

> Time tracking made simple

Live at: timekr.netlify.com

This site was inspired by tomato-timer.com, a simple Pomodoro timer (timer that counts 25 minutes backwards, since this is the optimal work/break policy for people that work in computers, according to studies). The additional bonus is that it keeps track of the total time you are counting with the timer, and also lets you add time "manually" on a project-basis.

Data is stored both in `localStorage` and as a cookie, so it should persist in your browser as long as you don't delete the cache.

_Disclaimer:_ Please notice this data is only stored in a single browser and in a single device, and that you should keep a separate record for the time you spent in projects in a more reliable place.
Also notice that, according to the Pomodoro work technique, you should alternate between 5 and 25 minutes breaks. This timer doesn't commit breaks nor does it count the time for them, so for the time being, you have to come up with a break policy and add the time manually.

## LICENCE

Standard MIT licence. opensource.org/licences/MIT

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## About

Build in React and TypeScript, CSS generated using tailwindcss.com

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production
$ npm run build
```
