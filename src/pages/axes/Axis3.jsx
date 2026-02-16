import AxisTemplate, { getAxisByNumber } from "./AxisTemplate";

export default function Axis3() {
  return <AxisTemplate {...getAxisByNumber(3)} />;
}
