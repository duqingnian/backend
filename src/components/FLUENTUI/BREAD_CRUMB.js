import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbDivider,
  BreadcrumbButton,
} from "@fluentui/react-components";

const BREAD_CRUMB = (props) => {
  console.info(props)
  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbButton href={"/"}>Item 1</BreadcrumbButton>
      </BreadcrumbItem>
      <BreadcrumbDivider />
      <BreadcrumbItem>
        <BreadcrumbButton href={"/"}>
          Item 2
        </BreadcrumbButton>
      </BreadcrumbItem>
      <BreadcrumbDivider />
      <BreadcrumbItem>
        <BreadcrumbButton href={"/"}>Item 3</BreadcrumbButton>
      </BreadcrumbItem>
      <BreadcrumbDivider />
      <BreadcrumbItem>
        <BreadcrumbButton href={"/"} current>
          Item 4
        </BreadcrumbButton>
      </BreadcrumbItem>
    </Breadcrumb>
  );
};

export default BREAD_CRUMB;

