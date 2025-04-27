import { Coins, Trophy, Wallet, CreditCard } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <CreditCard className="h-10 w-10" />,
      title: "Digital Scratch Cards",
      description: "Buy and scratch digital cards with realistic scratch-off animations.",
    },
    {
      icon: <Coins className="h-10 w-10" />,
      title: "Win Tokens",
      description: "Instantly win tokens that can be used to buy more cards or cash out.",
    },
    {
      icon: <Trophy className="h-10 w-10" />,
      title: "Exclusive NFTs",
      description: "Earn exclusive NFT badges as you reach milestones in your scratch journey.",
    },
    {
      icon: <Wallet className="h-10 w-10" />,
      title: "Wallet Integration",
      description: "Connect your crypto wallet to store your tokens and NFTs securely.",
    },
  ]

  return (
    <section id="features" className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Features</h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Experience the future of scratch cards with blockchain technology.
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-4">
        {features.map((feature, index) => (
          <div key={index} className="relative overflow-hidden rounded-lg border bg-background p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">{feature.icon}</div>
            <h3 className="mt-4 text-xl font-bold">{feature.title}</h3>
            <p className="mt-2 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
