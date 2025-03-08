import React from 'react'

const Loader = () => {
  return (
 
<div className="flex-col gap-4 w-full flex items-center justify-center">
  <div
    className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full"
  >
    <div
      className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"
    ></div>
  </div>
</div>


// /* From Uiverse.io by ArnavK-09 */ 
// <div
//   className="p-3 animate-spin drop-shadow-2xl bg-gradient-to-bl from-pink-400 via-purple-400 to-indigo-600 md:w-48 md:h-48 h-32 w-32 aspect-square rounded-full"
// >
//   <div
//     className="rounded-full h-full w-full bg-slate-100 dark:bg-zinc-900 background-blur-md"
//   ></div>
// </div>


  )
}

export default Loader
