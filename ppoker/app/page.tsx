export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='flex flex-col gap-8 row-start-2 items-center sm:items-start'>
        <ol className='list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]'>
          <li className='mb-2'>
            This will be my{' '}
            <code className='bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold'>
              Planning Poker app
            </code>
            .
          </li>
          <li>Changing page.tsx to experiment</li>
          <li>Take design elements from the app we use at work</li>
          <li>
            Palette to use: palette to consider: #073b4c #118ab2 #06d6a0 #ffd166
            #ef476f
          </li>
          <p className='blue'>blue</p>
          <p className='green'>green</p>
          <p className='yellow'>yellow</p>
          <p className='red'>red</p>
        </ol>
      </main>
      <footer></footer>
    </div>
  );
}
