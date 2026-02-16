import AxisTemplate, { getAxisByNumber } from "./AxisTemplate";

export default function Axis2() {
  return <AxisTemplate {...getAxisByNumber(2)} />;
}
