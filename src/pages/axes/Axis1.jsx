import AxisTemplate, { getAxisByNumber } from "./AxisTemplate";

export default function Axis1() {
  return <AxisTemplate {...getAxisByNumber(1)} />;
}
