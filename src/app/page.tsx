import "react-toastify/dist/ReactToastify.css";
import FixedRewardStakingComponent from "./component/FixedRewardStaking/fixedRewardStakingComponent";
import StakingWrapper from "./component/StackingWrapper/StakingWrapper";
export default async function Home() {
  return (
    <main className="flex flex-col gap-10 max-w-[100vw] overflow-x-hidden">
      {/* <FixedRewardStakingComponent /> */}
      <StakingWrapper />
    </main>
  );
}
