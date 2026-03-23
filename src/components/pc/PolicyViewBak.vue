<template>
  <div class="content-wrapper">
    <div style="text-align: center; width: 100%"><h1>朝阳区产业政策</h1></div>
    <div class="line-wrapper" style="margin-left: 15px">
      <el-radio-group
        v-model="state.radioselector"
        @change="handleOptionChange"
      >
        <el-radio-button value="1">商务经济</el-radio-button>
        <el-radio-button value="2">金融业</el-radio-button>
        <el-radio-button value="3">高新技术</el-radio-button>
        <el-radio-button value="4">文化产业</el-radio-button>
        <el-radio-button value="5">中小企业</el-radio-button>
        <el-radio-button value="6">商务中心区</el-radio-button>
        <el-radio-button value="7">引进人才</el-radio-button>
        <el-radio-button value="8">数字医疗</el-radio-button>
        <el-radio-button value="9">数据要素</el-radio-button>
        <el-radio-button value="10">人工智能</el-radio-button>
        <el-radio-button value="0">关键字检索</el-radio-button>
      </el-radio-group>
      <el-input
        v-if="state.showsearch"
        v-model.trim="state.searchkeywords"
        clearable
        placeholder="检索关键字"
        style="width: 180px; height: 32px; margin-left: 25px"
      />
      <el-button
        type="primary"
        @click="searchpolicies"
        style="margin-left: 5px"
        v-if="state.showsearch"
        >点击检索</el-button
      >
    </div>

    <div class="table-wrapper" style="margin-top: 10px">
      <el-table
        :data="state.curTableData"
        :border="parentBorder"
        :default-expand-all="true"
        style="width: 100%; height: calc(100vh - 220px)"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="line-wrapper-center">
              <div style="width: 90%">
                <div v-html="convertNewlines(props.row.content)"></div>
                <div>---------------------------</div>
                <div v-html="props.row.contact"></div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="政策标题" prop="title">
          <template #default="{ row }">
            <span class="bold-text" v-html="row.title"></span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="复制" min-width="5%">
          <template #default="scope">
            <el-button
              type="primary"
              :icon="Share"
              @click="handleCopy(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Share } from "@element-plus/icons-vue";
import useClipboard from "vue-clipboard3";
import request from "../../utils/request";

const parentBorder = ref(true);
const { copy } = useClipboard();

const gxjsTableData = ref([
  {
    title: "支持企业规模化发展-信息传输、软件和信息技术服务业",
    content:
      "信息传输、软件和信息技术服务业:对于首次纳入规模以上统计的企业，且当年营业收入拉动行业增速0.2个百分点的，给予30万元的资金支持。对于已设立企业,对上年度营业收入增速高于行业目标增速2个百分点且增量贡献突出的存量企业，给予最高500万元的资金支持。",
    contact: "负责处室:产业促进一处 64713626、64713690、64713363",
  },
  {
    title: "支持企业规模化发展-科学研究和技术服务业",
    content:
      "科学研究和技术服务业:对于首次纳入规模以上统计的企业，且当年营业收入拉动行业增速0.2个百分点的，给予30万元的资金支持。对于已设立企业,对上年度营业收入增速高于行业目标增速2个百分点且增量贡献突出的存量企业，给予最高200万元的资金支持。",
    contact: "负责处室:产业促进三处 17354417471",
  },
  {
    title: "支持企业规模化发展-工业",
    content:
      "对于首次纳入规模以上统计的企业，且当年工业总产值拉动行业增速0.2个百分点的，给予30万元的资金支持。对于已设立企业，对上年度工业总产值增速高于行业目标增速2个百分点且增量贡献突出的存量企业,给予最高200万元的资金支持。",
    contact: "负责处室:产业促进二处64317841、64713610",
  },
  {
    title: "支持企业加大研发投入",
    content:
      "支持企业加大研发创新投入，对于上年度实际研发投入总额超过1亿元,且纳入我区规模以上统计的信息传输、软件和信息技术服务业、科学研究和技术服务业、工业企业,择优给予最高500万元的支持。",
    contact: "负责处室:科技创新处64713373",
  },
]); // 朝阳区促进高新技术产业发展若干措施
const zxqyTableData = ref([
  {
    title: "激励企业提质升级（一）",
    content:
      "对在有效期内的科技型中小企业、中关村高新技术企业，首次纳入规模以上统计范围的,给予一次性5万元的资金奖励。\n对在朝阳区新增的国家高新技术企业，给予最高20万元的一次性资金奖励。\n对有效期满并再次获得认定的国家高新技术企业，给予10万元的资金奖励。\n科技型中小企业、中关村高新技术企业申请通过国家高新技术认定后享受差额奖励。",
    contact: "咨询电话:黄老师64317708",
  },
  {
    title: "激励企业提质升级（二）",
    content:
      "对在有效期内的创新型中小企业,首次纳入规模以上统计范围的,给予一次性5万元的资金奖励。\n对在朝阳区新增的北京市专精特新中小企业,符合条件的给子最高30万元的一次性资金奖励。\n对有效期满并通过复核的北京市专精特新中小企业,给予最高10万元的资金奖励。\n对在朝阳区新增及有效期满并首次通过复核的国家专精特新小巨人”企业,给予最高80万元的资金奖励。\n创新型中小企业、专精特新中小企业、国家专精特新“小巨人”企业晋级享受差额奖励。",
    contact: "咨询电话:孙老师 64313004",
  },
  {
    title: "支持新经济新模式发展",
    content:
      "对在朝阳区首次列入官方发布的潜在独角兽企业榜单、独角兽企业榜单的分别给予最高50万元、80万元的资金奖励，晋级享受差额奖励。",
    contact: "咨询电话:孙老师 64313004",
  },
  {
    title: "支持具备国际元素的创新创业企业落地发展",
    content:
      "在国(境)外高等院校学习满一年以上并获得学士及以上学位的留学(来华)人员，对于其近两年新注册成立且持股权不低于30%，并在中国证券投资基金业协会备案的投资机构获得股权融资的科技创新型企业,给予一次性最高20万元落地支持。",
    contact: "咨询电话:朱老师 64360358",
  },
  {
    title: "降低企业研发创新成本",
    content:
      "支持中小企业创新发展,引导中小企业持续加大研发投入，提升自主创新能力，上一年度研发投入占比达到8%以上，且拥有核心知识产权的,按照研发费用总额的20%予以奖励,每家企业年度支持额度最高不超过100万元。",
    contact: "咨询电话:赵老师 64310206",
  },
  {
    title: "支持企业贷款融资",
    content:
      "对获得朝阳区域内银行贷款的中小企业，按照单笔贷款实际支付利息的30%给予贴息支持,按月计算;每家企业每年贴息额度最高100万元。连续申请贷款贴息补助、单笔贷款贴息一般均不超过两年。",
    contact: "咨询电话:张老师 64386071",
  },
  {
    title: "支持企业利用多种融资方式",
    content:
      "对通过知识产权质押贷款、短期融资券、私募债券、融资租赁等方式进行融资的中小企业，按照单笔融资实际支付利息的30%给予贴息支持,按月计算;每家企业每年贴息额度最高100万元,连续申请创新融资补助、单笔融资贴息一般均不超过两年。",
    contact: "咨询电话:张老师 64386071",
  },
  {
    title: "支持企业提升品牌影响力",
    content:
      "鼓励企业扩展国外市场，对专精特新企业参加国家指定的国际级大型展会，按照项目实际发生费用的30%予以补贴，每家企业年度支持额度最高不超过30万元。",
    contact: "咨询电话:孙老师 64313004",
  },
  {
    title: "完善企业服务体系-鼓励中小企业服务平台建设",
    content:
      "支持专业服务机构建设公共服务平台，为朝阳区的中小企业提供创新创业、场景对接、技术转移、知识产权以及管理咨询等专业服务。围绕平台建设过程中公共服务方面所投入的成本，根据服务绩效给予每家机构总额度不超过200万元支持,财政补贴金额不超过实际支出金额的50%。",
    contact: "咨询电话:袁老师 64318324",
  },
  {
    title: "完善企业服务体系-鼓励载体平台培育服务提质增效",
    content:
      "引导重点园区(楼宇)、创新创业载体、服务机构加强企业培育服务，针对企业不同发展阶段加强分层分类服务，鼓励开展公益性、普惠性服务活动,在政策宣讲、资质申报、手续办理、融资咨询、办公空间等全方位提供定向服务,为企业全生命周期提供多样化、精准化、便捷化服务,促进优质企业集聚发展。在培育服务的企业中,根据新认定北京市专精特新中小企业、国家级专精特新“小巨人”企业、国家高新技术企业的数量,给予最高不超过50万元奖励。",
    contact: "咨询电话:袁老师 64318324",
  },
]); // 朝阳区加快推进中小企业梯度培育若干措施
const swjjTableData = ref([
  {
    title: "总部经济领域-落户奖励",
    content:
      "1.对新认定或新设立的跨国公司地区总部,给予一次性资金奖励,奖励金额不超过1000万元.\n2.对在我区持续稳定发展且贡献突出的新认定或新设立跨国公司地区总部,给予连续三年资金奖励,每年奖励金额不超过500万元:",
    contact: "咨询电话:65099575",
  },
  {
    title: "消费领域-贡献奖励",
    content:
      "1.对新设立的突出贡献零售企业(重点支持汽车类、电商平台类、时尚零售类等)、零售业交付中心或结算中心(含增设)给予一次性资金奖励，奖励金额不超过1000万元。\n2.对上一年度社零额同比增速高于全区平均增速(且正增长)的企业,对于高于全区社零额平均增速(且正增长)的社零额部分,每增长1亿元奖励不超过10万元，最高不超过1000万元\n3.对上一年度社零额总量贡献突出的企业给予最高不超过200万元资金奖励。\n4.对百货店、超市、专业专卖店(不含汽车)、网上商店、汽车和餐饮业六大业态，上一年度社零额同比增速高于全区社零额平均增速(且正增长)的企业中,社零额增量贡献突出的企业，给予不超过50万元资金奖励。\n5.对于新设立的新纳统及首次纳入限额以上统计的餐饮业企业，且当年营业额拉动行业增速0.2个百分点以上的，给予最高不超过25万元资金奖励。对于已设立企业，上年度营业额增速高于行业目标增速2个百分点，且增量贡献突出的餐饮业企业，给予最高不超过25万元资金奖励。",
    contact: "咨询电话:65090679",
  },
  {
    title: "消费领域-商圈改造",
    content:
      "1.传统商场改造支持,按照不超过审定实际投资额的30%给予资金支持,单个项目支持总额最高1500万元.\n2.深夜特色街区建设,按照不超过审定实际投资额30%给予支持,最高不超过200万元。",
    contact: "咨询电话:65090283",
  },
  {
    title: "消费领域-消费创新",
    content:
      "对获得上一年度北京市首店政策支持的优秀时尚零售、餐饮企业和引进方企业，按照市级支持额度的50%,给予最高不超过250万元奖励。",
    contact: "咨询电话:65090677",
  },
  {
    title: "批发业领域",
    content:
      "新设立\n对新设立的突出贡献批发业企业(重点支持生物医药、新能源汽车类、高端装备类、绿色能源类等),给予一次性资金奖励,奖励金额不超过1000万元。新纳统或首次纳入限额以上统计的批发和零售业企业，且当年销售额拉动行业增速0.2个百分点以上,给予一次性资金奖励,奖励金额不超过500万元.\n\n已设立\n对于已设立企业,上年度销售额增速高于行业目标增速2个百分点,且增量贡献突出的批发和零售业企业,给予最高不超过500万元资金奖励。\n\n市级配套\n对获得北京市批发业支持政策资金奖励的企业,按照市级支持额度的50%,给予最高不超过500万元资金奖励。",
    contact: "咨询电话:65090857",
  },
  {
    title: "租赁和商务服务业领域",
    content:
      "1.对新设立的突出贡献租赁和商务服务业企业及国际知名商务服务业企业,给予一次性资金奖励,奖励金额不超过1000万元。新纳统及首次纳入规模以上统计的租赁和商务服务业企业,且当年营业收入拉动行业增速0.2个百分点以上,给予一次性资金奖励,奖励金额不超过200万元。\n2.对于已设立企业,上年度营业收入增速高于行业目标增速2个百分点,且增量贡献突出的租赁和商务服务业企业,给予最高不超过200万元资金奖励。\n3.对组织管理服务、综合管理服务、法律服务、咨询与调查、人力资源服务、广告业以及会议展览七大商务服务业重点行业中类,上一年度各行业中类商务经济领域综合评价突出的企业,给予最高不超过50万元资金奖励。",
    contact: "咨询电话:65090857",
  },
  {
    title: "外资外贸领域",
    content:
      "实际利用外资\n实际利用外资在10亿美元(含)以上的，最高500万元资金奖励。实际利用外资在5亿美元(含)至10亿美元，最高300万元资金奖励。实际利用外资在1亿美元(含)至5亿美元，最高200万元资金奖励。实际利用外资5000万美元(含)至1亿美元，最高100万元资金奖励。\n\n外向型经济发展\n对上一年度服务贸易贡献突出的企业给予一次性资金奖励，最高不超过50万元",
    contact: "咨询电话:65099206",
  },
]); // 朝阳区促进商务经济高质量发展若干措施
const jryTableData = ref([
  {
    title: "1. 鼓励金融机构落户，给予一次性落户奖励",
    content:
      "法人金融机构\n对在朝阳区新设的法人金融机构，根据其综合贡献给予一次性落户奖励，最高给予2500万元。具体为:实收资本在1亿元以上、5亿元(不含)以下的,给予250万元一次性落户奖励;实收资本在5亿元以上、10亿元(不含)以下的，给予500万元一次性落户奖励;实收资本在10亿元以上、30亿元(不含)以下的，给予1000万元一次性落户奖励;实收资本在30亿元以上的,给予2500万元一次性落户奖励。\n对于具有标志性意义的中外合资以及外商独资金融机构，实收资本不足1亿元的，可按照1亿元标准执行。\n]n金融机构分支机构\n对在朝阳区新设的金融机构分支机构，根据其综合贡献给予其一次性落户奖励。具体为:对在朝阳区新设的金融机构一级分支机构及银行二级分行，给予200万元一次性落户奖励。",
    contact: "",
  },
  {
    title: "2.鼓励金融机构发展,对金融机构给予增资奖励",
    content:
      "对区内金融机构实收资本一次性增资10亿元以上、100亿元(不含)以下的，给予一次性奖励500万元;实收资本增资100亿元以上的，给予一次性奖励1000万元。",
    contact: "",
  },
  {
    title: "3.鼓励金融机构在朝阳区持续稳定发展，对金融机构给予稳定发展奖励",
    content:
      "对在朝阳区规范经营的金融机构持续稳定发展1年以上的,经综合评价认定符合标准的，可申请6次稳定发展奖励,每家机构每次补贴金额上限不超过500万元;扩大生产经营规模的，可参照上述标准执行。",
    contact: "",
  },
  {
    title: "4.鼓励金融机构在朝阳区持续稳定发展，对金融机构给予稳定发展奖励",
    content:
      "项目投资奖励\n对在朝阳区规范经营的金融机构持续稳定发展1年以上的,经综合评价认定符合标准的，可申请6次稳定发展奖励,每家机构每次补贴金额上限不超过500万元;扩大生产经营规模的，可参照上述标准执行。\n\n项目退出奖励\n对于在朝阳区设立的私募基金管理人和所管理股权投资基金(含OFLP试点基金)实现项目退出时，根据机构综合影响力、对区域重点产业的支持力度、对区域高精尖产业的引导作用等予以奖励。以公司制形式设立的股权投资类企业，给予企业奖励;以合伙制形式设立的股权投资类企业，给予合伙企业的管理企业奖励,最高金额不超过人民币2000万元。\n\n其他相关支持\n加强引导投资模式创新，支持境外资金设立人民币创业投资母基金。拓宽私募基金退出渠道,支持设立各类S基金。",
    contact: "",
  },
  {
    title: "5.加快推动金融领域“两区”建设,打造国际金融开放前沿区",
    content:
      "不断推进金融领域扩大开放，大力吸引创新性、引领性项目落地。在符合国家法律法规、规章、规范性文件及相关政策的前提下,对标国际先进规则,探索拓宽规则、规制、管理、标准开放渠道。落实国际收支便利化改革措施,有序推进人民币国际化进程,扩展跨境人民币使用场景。鼓励区内金融机构积极开展“两区”试点业务,持续推动跨国公司本外币一体化资金池试点等政策试点落地,服务首都金融高质量发展。",
    contact: "",
  },
  {
    title: "6.打造一流优质的金融业营商环境",
    content:
      "打造高效便捷的服务环境深化落实“服务包”与“服务管家”工作机制,对重点金融机构加强“一对一”精准服务,切实解决金融机构发展中的问题困难。加强与国际金融中心城市及“一带一路”沿线国家和地区主要金融中心城市的交流,对标对表持续提升区域发展环境。在符合国家法律法规、规章、规范性文件及相关政策的前提下,为金融人才提供生活便利及优质服务保障,整合区域内医疗、教育、住房等优质服务资源,在人才评选、人才引进、医疗服务等重点领域为金融机构人才协调相关事宜，提供服务保障。推动国际人才社区、国际学校、国际医院、国际人才交流中心等重点项目建设,为海外金融人才提供国际化优质服务。",
    contact: "",
  },
  {
    title: "7.其他支持",
    content:
      "对知名度高、功能性强、在推动朝阳区金融产业发展过程中能够起到关键作用的、以及符合区域金融业发展定位重点引入或重点扶持的机构或组织，经区政府批准后给予政策支持。对朝阳区金融产业发展起到突出作用的产业服务平台、宣传推介活动、重点金融论坛、课题研究和上市培育项目等,经区政府批准后可由金融产业引导资金列支相关经费。",
    contact: "",
  },
]); // 朝阳区支持金融业发展的若干措施
const whcyTableData = ref([
  {
    title: "（一）支持文化企业发展壮大",
    content:
      "1.对拉动文体娱行业增速明显的新纳统企业，给予30万元一次性奖励支持;对文体娱行业中营收增速较快且增量贡献突出的企业，最高支持200万元。\n2.对文化产业带动作用突出的企业，最高支持300万元;对成长较快且贡献突出的企业，最高支持200万元.",
    contact: "",
  },
  {
    title: "（二）支持文化产业新业态发展",
    content:
      "1.对通过云计算、人工智能、虚拟现实、高清制播等技术开展的市场效益突出的文化科技融合项目，最高支持300万元.\n2.对新投入使用的、在行业内具有重大示范意义的文旅消费新场景，最高支持200万元.\n3.对在朝阳区举办的、业内权威且具有重大影响力的品牌文旅消费活动，最高支持200万元4.对精品演出剧目、优质影片、动漫网游、网络视听节目等文化消费产品，最高支持200万元.",
    contact: "",
  },
  {
    title: "（三）支持文化产业园区提质增效",
    content:
      "1.对通过老旧工业厂房改造、低效空间升级等方式新转型的文化产业园区，最高支持200万元。\n2.对营收首次超过百亿元的文化产业园区，最高支持200万元;对积极参与以商招商、提升服务品质且综合效益增长明显的文化产业园区，最高支持200万元.\n3.对综合效益显著提升的文化科技融合发展特色园区，最高支持200万.",
    contact: "",
  },
  {
    title: "（四）支持文化企业开展各类融资",
    content:
      "对文化企业实际发生的银行贷款利息、担保费融资租赁租息、信用评级费用等融资成本，最高补贴200万元。",
    contact: "",
  },
  {
    title: "（（五）支持影视产业创新发展",
    content:
      "1.对新纳统影视企业，给予10万元一次性奖励支持。\n2.对在北京市完成备案立项且已经开机拍摄的影视作品，最高支持200万元.\n3.对重点影视企业开展的影视行业重大关键技术创新项目，最高连续三年、每年支持800万元.\n4.对影视工业化平台建设(包括云渲染、影视制作、虚实交互、数字拍摄等关键技术)，最高支持500万元.\n5.对向行业开源开放的影视平台项目，最高支持300万元。",
    contact: "",
  },
]); // 朝阳区促进文化产业高质量发展的若干措施
const yjrcTableData = ref([
  {
    title: "1. 支撑区域经济增长",
    content:
      "企业(或机构)设立之日起3个自然年内，任意一年对我区经济增长产生重要支撑作用的，根据综合评价结果，对服务机构分档给予奖励，最高不超过500万元。",
    contact: "",
  },
  {
    title: "2. 促进重点产业高质量发展",
    content:
      "企业(或机构)设立之日起3个自然年内，任意一年对我区重点产业高质量发展产生重要支撑作用的，对服务机构给子30万元一次性奖励。",
    contact: "",
  },
  {
    title: "3. 鼓励外商企业投资",
    content:
      "企业(或机构)设立之日起3个自然年内，对我区实际利用外资规模产生重要支撑作用的，对服务机构给予一次性奖励，最高不超过100万元。",
    contact: "",
  },
  {
    title: "4. 鼓励重点国际功能性机构集聚",
    content:
      "鼓励服务机构为在朝阳区新设的具有重要影响力的国际机构、国际组织、外国商会等功能性机构提供服务,经综合评价,认定为对我区营商环境及产业发展环境产生重大提升意义的,每服务一家给予服务机构20万元一次性奖励。",
    contact: "",
  },
]); // 朝阳区引进人才促进产业提质升级奖励办法
const cbdTableData = ref([
  {
    title: "推动总部经济能级跃升",
    content:
      "1.积极吸引总部企业落户\n新入选或新设的中国服务业、制造业、民营等相关“500强”、软件和信息技术服务竞争力百强、中国互联网企业综合实力指数百强等榜单的企业总部，以及新设央企二级以上子公司，给予不超过500万元次性资金支持。\n\n2.鼓励新设功能性总部\n新认定的投资、结算、采购、销售、研发等功能性总部，给予不超过400万元一次性资金支持。支持外资研发机构设立发展，新认定或新设的外资研发中心给予不超过400万元一次性资金支持。\n\n3.推动总部企业特色化发展\n新认定的以国内批发零售、国际货物或服务贸易、平台交易等为主营业务的贸易型总部企业，以商务服务、科技服务、信息服务、医疗健康、旅游、文化体育和娱乐、住宿餐饮等为主营业务的服务型总部企业，以银行、保险、证券、融资租赁、资产管理、汽车金融、支付等为主营业务的金融总部企业，及新认定的高成长创新型总部企业，给予不超过300万元次性资金支持。\n\n4.支持总部企业发展跨境贸易\n新设或首次通过AEO高级认证的总部企业，给予20万元一次性资金支持。",
    contact: "",
  },
  {
    title: "建设好国际金融聚集区",
    content:
      "1.推动数字人民市场景应用\n在CBD区域开展数字人民币场景应用并取得示范效应的商业主体，经认定给予10万元一次性资金支持。对获区级以上部门肯定的应用场景，支持标准提高至20万元。\n\n2.支持跨境人民币业务创新和推广\n支持企业办理人民币外汇衍生品业务，按照上一年度履约金额名义本金(人民币)，给予企业不超过3万元一次性资金支持。\n\n3.激励金融成果与机制创新\n支持对首都金融业有重大突出贡献的科技成果或对首都金融发展有制度性贡献的体制机制设计，对获得首都金融创新激励项目的企业，按照不超过市支持金额的50% 给予配套支持。",
    contact: "",
  },
  {
    title: "建设一流千亿规模国际级商圈",
    content:
      "1.加大优质品牌企业入驻\n引入国际知名商业品牌直营店、知名时尚消费品牌直营店，给予不超过300万元资金支持。引入将中华优秀传统文化更多融入现代生产生活、促进传统文化的创造性转化和创新性发展的国潮品牌直营店，给予不超过150万元资金支持。\n\n2.加强新兴及服务消费培育\n便利进口商品消费，支持开设跨境商品直购体验中心、进口商品直营店，给予一次性不超过150万元稳定发展支持。支持美丽健康消费服务供给，对日用化学、生物保健、医疗器械、健康管理等领域企业，年度营业收入实现突破性增长，给予不超过300万元次性资金支持。\n\n3.优化区域消费环境\n鼓励发展区域夜间经济。支持连锁餐饮和零售业企业、连锁医美企业、品牌书店、博物馆、美术馆等文化旅游场所提供24小时营业服务，培育无人健身房、24小时健身房等新业态。结合CBD大型活动带来“潮汐式”客流群体消费需求，鼓励有条件的品牌连锁商场、购物中心和文化艺术场所适当延长夜间经营时间。\n\n4.提升数字化商业服务水平\n支持企业开展数字管理提升，根据数字化平台建设实际投资的50%给予企业不超过300万元资金支持。支持商业体进行数字化升级，对获得国家或者市级认定的智慧商店，单个项目给予不超过50万元一次性资金支持。\n\n5.营造文化艺术消费氛围\n促进国际文物艺术品产业发展，新设且上一年度文物艺术品销售或拍卖额达到3000万元及以上的经营企业，按照综合评价结果，给予不超过500万元的资金支持;鼓励艺术博览会、拍卖会、拍卖周等国际文物艺术品交易场景落地，销售或拍卖额达到3000万元及以上的主办方，按照综合评价结果，给予不超过200万元资金支持。",
    contact: "",
  },
  {
    title: "加大吸引和利用外资力度",
    content:
      "1.鼓励跨境投资开放试点\n对新设或新获批试点资格且依法登记备案的合格境外有限合伙人(QFLP)，给予100万元一次性资金支持。\n\n2.促进存量企业提级扩容\n对符合CBD产业发展方向的外国投资者以追加投资或以企业利润、资本公积金等转增注册资本的，年实缴合同总额1亿元人民币(或1500万美元)及以上的，按照当年实缴合同总额的一定比例给予不超过100万元资金支持。外商投资企业由非独立法人升级为独立法人的，给予10万元一次性支持;外商投资企业法人公司升为规上企业及营收突破的，给予50万元一次性支持。\n\n3.集聚一批外商投资专业服务机构\n积极吸引知名国际组织、外国商会、国际知名公益机构、国际教育机构入驻，鼓励国际要素交易、国际仲裁、国际认证、国际评级等专业服务机构入驻，连续三年累计给予不超过600万元稳定发展支持。争取建设北京CBD国际知识产权公共服务站，提供国际知识产权咨询、维权援助、宣传培训等服务.",
    contact: "",
  },
  {
    title: "打造国际一流营商环境先行示范区",
    content:
      "1. 加强外资发展要素支持和服务保障\n加快建立健全统筹协调、跟踪服务等外商投资常态化沟通机制，协调推动解决各类困难问题，加强要素支撑、政策支持和服务保障。\n\n2.强化高端服务业及专业服务机构集聚\n国际或国内排名前十的法律服务、会计审计、评估服务、人力资源服务、信用服务等专业服务企业设立发展，给予不超过500万元一次性资金支持。\n\n3.鼓励打造高品质商务楼宇空间\n根据CBD楼宇品质分级评价标准，引导存量商务楼宇迭代升级，指导在建项目高品质建设，为企业发展提供优质承载空间。新认定“五星甲级”“六星超甲级”“七星顶级”商务楼宇，分别给予30万元、100万元、300万元资金支持。\n\n4.完善国际化发展模式\n支持国内外企业联络站运营，根据年度考核结果，给予境外站、国内站一定程度资金支持。\n\n5.优化国际专业人才发展环境\n实施区域特色人才发展计划，对获评北京CBD招商大使以及获得金牌楼宇管理员认证人才，列入朝阳区高精尖企业人才奖励范围。",
    contact: "",
  },
]); // 促进北京商务中心区高质量发展若干措施
const szylTableData = ref([
  {
    title: "支持基于人工智能的药物研发",
    content:
      "支持企业和科研机构围绕创新药物研发的关键技术和关键环节，开展新算法设计及优化、功能预测、基因编辑设计、递送载体构建、自动化高通量筛选等药物创新研发和验证评价，对在朝阳区数字医疗产业创新发展中起到关键作用的项目，根据项目成效，可给予最高不超过1000万元资金支持。",
    contact: "",
  },
  {
    title: "支持人工智能辅助诊断和辅助治疗产品开发",
    content:
      "支持企业和科研机构开发具备鉴别诊断、性质判定等功能的人工智能辅助诊断产品，以及针对临床诊疗需求，实现手术规划和治疗决策等功能的人工智能辅助治疗产品，对产品技术、性能处于国内外领先水平，具有较高临床价值的产品，最高支持额度不高于500万元。",
    contact: "",
  },
  {
    title: "支持智能化高端医疗装备和医疗器械发展",
    content:
      "支持手术机器人、医学影像设备、体外诊断（IVD）产品、基因检测与合成设备、手术治疗及生命支持设备、中医诊疗装备、智能医疗软件等智能化医疗器械产业的发展，对纳入国家医疗器械创新或优先审批通道的第三类医疗器械完成临床试验的，单个产品给予最高不超过300万元的资金支持；其他第三类医疗器械完成临床试验的，单个产品给予最高不超过100万元的资金支持；对首次取得二类、三类医疗器械注册证、在朝阳区产业化的医疗器械产品，单个产品给予一次性资金支持500万元。单个企业每年支持额度最高不超过1000万元。\n支持企业或科研机构基于人工智能技术，开展对现有高端治疗装备智能化升级改造或独立软件开发，实现关键工艺优化和性能参数提升，对临床前完成工程化样机研制、独立软件定型并取得国家认可的第三方检测机构出具的型检报告的产品，给予一次性资金支持200万元。",
    contact: "",
  },
  {
    title: "支持中医药领域数字化",
    content:
      "支持企业和科研机构基于新一代信息技术，围绕名老中医诊疗思想、中医药辩证逻辑和诊断规律、经典名方和名老中医经验方等内容，开展中医药领域的数字化转型。对形成的中医临床诊疗平台、中医药数字化循证服务平台、中医药研发和验证平台等项目，根据与中医药专家诊疗结果匹配度，给予最高不超过500万元的资金支持。",
    contact: "",
  },
  {
    title: "支持医药健康数据开放应用",
    content:
      "鼓励企业和科研机构围绕医疗数据标准的制定、数据应用先行先试、数据开放共享、数据交易、数据跨境流动等方面依法依规开展医药健康数据相关业务。根据数据规模、数据质量和应用效果，给予最高不超过200万元的资金支持。",
    contact: "",
  },
  {
    title: "支持基于新一代信息技术的医药健康管理和服务",
    content:
      "支持企业和科研机构利用新一代信息技术，围绕医疗卫生机构、互联网医疗领域、药企全生命周期业务、可穿戴设备及健康应用程序（APP）、医疗保险业务等方面，开展各类管理服务，对在实现早筛早诊、精准医疗、加速康复、降低医疗成本等方面，具有显著价值和贡献的，给予最高不超过300万元的资金支持。",
    contact: "",
  },
  {
    title: "加大人才引培力度",
    content:
      "支持医药健康领域高层次人才集聚创新创业，加大对技术创新的支持力度。支持产学研用主体联合开展课题研究，对于申请获得国家自然科学基金委员会、国家卫生健康委员会、北京市科学技术委员会（中关村科技园区管理委员会）、北京市经济和信息化局等数字医疗相关项目立项的，按照获批资助额度20%的比例，一次性给予最高不超过200万元的资金支持。对于学科带头人、战略科学家、首席医学官、企业创始团队、优秀青年人才以及AI医疗专家等创新创业领军人才给予人才认定、住房保障、子女教育等人才服务。加大人才培养力度，鼓励各类院校、科研机构与企业创新校企合作人才培养模式，建立定向人才输送通道，加强对产业发展紧缺的复合人才、专业人才的培养力度。",
    contact: "",
  },
]); // 数字医疗
const sjysTableData = ref([
  {
    title: "支持开展数据要素综合服务",
    content:
      "支持数据商、专业服务机构等聚焦数据要素交易流通，为企业提供包括数据治理、数据合规、数据托管、数据登记、数据评估、数据入表、数据交易、数据跨境等服务。根据数据商、专业服务机构服务成效，每年可给予最高不超过500万元资金支持。",
    contact: "",
  },
  {
    title: "支持数据产品登记、上架、交易、交易登记备案",
    content:
      "支持企业通过位于朝阳区的数据交易平台开展数据产品上架、交易、数据跨境、数据资产金融创新等活动。对企业上架数据产品数量达到50个以上，或取得数据要素登记证书达到5个以上，给予50万元资金支持；对企业在依法设立的数据交易机构进场数据交易的，按照其年度数据交易总规模的5%给予资金支持，对于企业进场进行数据交易登记备案的，按照其年度交易总规模的1%予以资金支持。上述项目同一企业年度支持资金总额最高不超过200万元。",
    contact: "",
  },
  {
    title: "支持数据入表",
    content:
      "首次实现数据资产入表，且入表金额大于50万元的，给予50万元资金支持。",
    contact: "",
  },
  {
    title: "支持数据跨境",
    content:
      "鼓励企业开展数据跨境流动业务，对首次通过数据出境主管部门安全评估或标准合同备案、个人信息保护出境认证证书等方式实现数据合规出境的企业，给予50万元资金支持。",
    contact: "",
  },
  {
    title: "支持高质量数据集供给",
    content:
      "支持企事业单位围绕智慧城市、金融、医疗健康、教育、消费等领域建设开放高质量数据集、语料库等，支持通用人工智能大模型和面向行业应用的大模型训练。根据数据规模、数据质量、更新频率和应用效果等，给予最高200万元资金支持。",
    contact: "",
  },
  {
    title: "支持应用场景建设",
    content:
      "支持围绕重点产业、智慧城市、医疗健康、商业、金融、文旅等领域开发高质量数据产品，落地高价值应用场景。对数据要素×典型应用案例、应用场景建设项目，按照不超过新技术、产品、服务、研发与建设投资额（不含土建）的30%给予资金支持，单个项目支持金额最高不超过500万元，优先支持场景建设单位采购企业创新技术、产品、服务进行场景项目建设。",
    contact: "",
  },
  {
    title: "支持标杆解决方案",
    content:
      "支持对技术创新性强、已在行业领域形成落地应用、具有典型行业示范作用的标杆解决方案予以支持，每项支持最高不超过50万元。",
    contact: "",
  },
  {
    title: "支持数据要素企业融资发展",
    content:
      "支持数据要素企业依托数据资产、数据知识产权等进行多渠道融资，对依托数据资产、数据知识产权、数据托管等获得银行贷款、短期融资券、私募债券等融资的数据要素企业，按照贷款金额或融资金额的2%给予贴息支持，按月计算，每家企业每年贴息额度最高不超过200万元。连续申请银行贷款贴息、单笔贷款贴息或创新融资补助、单笔融资贴息一般均不超过两年。",
    contact: "",
  },
  {
    title: "支持开展数据要素标准创制",
    content:
      "支持开展数据要素关键领域标准制定。综合企业上一年度参与标准起草及起草过程中发挥作用情况，对主导制定国家、北京市、行业标准的，分别按照单项最高100万元、40万元、20万元给予资金支持。同一单位所获支持总额不超过200万元。鼓励企业主导或积极参与数据要素关键领域国际标准制订或国际标准互认，参照国家标准给予支持。",
    contact: "",
  },
]); // 数据要素
const rgznTableData = ref([
  {
    title: "加强算力资源保障",
    content:
      "实施算力伙伴合作计划，遴选区域内优质算力服务商，对通用大模型、行业大模型训练优化及其他相关研发创新活动购买合作伙伴算力服务费用给予资金支持，支持金额最高不超过合同实际发生金额的50%，每家企业每年支持金额不超过500万元。",
    contact: "",
  },
  {
    title: "支持大模型创新应用",
    content:
      "鼓励大模型应用多样化发展，支持政务服务、城市管理、文化创意、医疗卫生、金融、商务、工业、教育等行业开放场景需求，推动大模型与产业深度融合实践。对引领性、创新性的大模型应用场景项目，按照不超过研发与建设投资额（不含土建）的80%给予资金支持，单个项目支持金额最高不超过500万元。",
    contact: "",
  },
  {
    title: "支持优秀垂直领域模型",
    content:
      "每年评选一批性能先进并成功应用的优秀垂直领域模型，依据行业引领与示范效应，每项给予最高不超过200万元支持。",
    contact: "",
  },
]); // 通用人工智能

const state = reactive({
  radioselector: "2",
  searchkeywords: "",
  curTableData: [],
  showsearch: false,
});

const convertNewlines = (text) => {
  return text.replace(/\n/g, "<br>");
};

// 点击复制
const handleCopy = async (rowinfo) => {
  //console.info("row", rowinfo);
  const rowDataString = rowinfo.title + "\n" + rowinfo.content;
  copyText(rowDataString);
  // try {
  //   // 将行数据转换为字符串
  //   const rowDataString = rowinfo.title + "\n" + rowinfo.content;
  //   console.info("rowDataString", rowDataString);
  //   // 使用 Clipboard API 复制数据到剪贴板
  //   await copy(rowDataString);
  //   console.info("here", "1");
  //   ElMessage({
  //     message: "数据已复制到剪贴板!",
  //     type: "success",
  //   });
  //   console.info("here", "2");
  // } catch (error) {
  //   ElMessage.error("复制数据到剪贴板时出错:", error);
  // }
};
const { toClipboard } = useClipboard();
const copyText = async (tetx_info) => {
  try {
    await toClipboard(tetx_info);
    ElMessage({
      message: "数据已复制到剪贴板!",
      type: "success",
    });
  } catch (error) {
    ElMessage.error("复制数据到剪贴板时出错:", error);
  }
};

const searchfromarray = (dataarray) => {
  dataarray.value.forEach((item) => {
    let hasKeyword = false;
    const newItem = { ...item };
    for (const key in newItem) {
      if (newItem.hasOwnProperty(key) && typeof newItem[key] === "string") {
        if (newItem[key].includes(state.searchkeywords)) {
          hasKeyword = true;
          newItem[key] = newItem[key].replace(
            new RegExp(state.searchkeywords, "g"),
            `<span style="color: red; font-weight: bold;">${state.searchkeywords}</span>`
          );
        }
      }
    }
    if (hasKeyword) {
      state.curTableData.push(newItem);
    }
  });
};

// 点击搜索 以state.searchkeywords为关键字匹配
const searchpolicies = () => {
  state.curTableData = [];
  // 遍历原数组
  searchfromarray(gxjsTableData);
  searchfromarray(zxqyTableData);
  searchfromarray(swjjTableData);
  searchfromarray(jryTableData);
  searchfromarray(whcyTableData);
  searchfromarray(yjrcTableData);
  searchfromarray(cbdTableData);
  searchfromarray(szylTableData);
  searchfromarray(sjysTableData);
  searchfromarray(rgznTableData);
};

// 执行简单装载数据
const loaddata = (data) => {
  state.curTableData = [];
  state.curTableData = ref([...data.value]);
};

// 选项变更
const handleOptionChange = () => {
  switch (state.radioselector) {
    case "1":
      state.showsearch = false;
      state.searchkeywords = "";
      state.curTableData = ref(JSON.parse(JSON.stringify(swjjTableData.value)));
      break;
    case "2":
      state.showsearch = false;
      state.searchkeywords = "";
      state.curTableData = ref(JSON.parse(JSON.stringify(jryTableData.value)));
      break;
    case "3":
      state.showsearch = false;
      state.searchkeywords = "";
      state.curTableData = ref(JSON.parse(JSON.stringify(gxjsTableData.value)));
      break;
    case "4":
      state.showsearch = false;
      state.searchkeywords = "";
      state.curTableData = ref(JSON.parse(JSON.stringify(whcyTableData.value)));
      break;
    case "5":
      state.showsearch = false;
      state.searchkeywords = "";
      state.curTableData = ref(JSON.parse(JSON.stringify(zxqyTableData.value)));
      break;
    case "6":
      state.showsearch = false;
      state.searchkeywords = "";
      state.curTableData = ref(JSON.parse(JSON.stringify(cbdTableData.value)));
      break;
    case "7":
      state.showsearch = false;
      state.searchkeywords = "";
      state.curTableData = ref(JSON.parse(JSON.stringify(yjrcTableData.value)));
      break;
    case "8":
      state.showsearch = false;
      state.searchkeywords = "";
      state.curTableData = ref(JSON.parse(JSON.stringify(szylTableData.value)));
      break;
    case "9":
      state.showsearch = false;
      state.searchkeywords = "";
      state.curTableData = ref(JSON.parse(JSON.stringify(sjysTableData.value)));
      break;
    case "10":
      state.showsearch = false;
      state.searchkeywords = "";
      state.curTableData = ref(JSON.parse(JSON.stringify(rgznTableData.value)));
      break;
    case "0":
      state.showsearch = true;
      state.searchkeywords = "";
      state.curTableData = [];
      break;
    default:
  }
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  //getGames();
  state.radioselector = "3"; // 默认高新技术
  state.curTableData = ref(JSON.parse(JSON.stringify(gxjsTableData.value)));
});
</script>

<style lang="scss" scoped>
.workzonehead-wrapper {
  width: 100%;
  margin-top: 15px;
  height: 64px;
  background-color: white;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.ml-4 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-left: 5px;
}

.content-wrapper {
  height: calc(100vh - 80px);
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.table-wrapper {
  width: 100%;
}

.pagination-wrapper {
  width: 90%;
  padding: 0 0 15px 15px;
}

.table-fold-wrapper {
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 0 0 15px;
}

.fold-line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.line-wrapper-center {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.upload-demo {
  width: 160px;
}

.bold-text {
  font-weight: bold;
}

h1 {
  font-family: Arial, sans-serif; /* 字体 */
  font-size: 24px; /* 字体大小 */
  font-weight: bold; /* 字体粗细 */
  color: #333; /* 文字颜色 */
  text-align: center; /* 文字居中对齐 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); /* 文字阴影 */
  letter-spacing: 1px; /* 字符间距 */
  line-height: 1.2; /* 行高 */
}
</style>
