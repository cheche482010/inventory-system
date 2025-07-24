import { createApp } from "vue"
import { createPinia } from "pinia"
import router from "./router"
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import "./assets/styles/main.scss"

// FontAwesome
import { library } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import {
  faHome,
  faBox,
  faTags,
  faUsers,
  faSignOutAlt,
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faEye,
  faSave,
  faTimes,
  faCheck,
  faExclamationTriangle,
  faChartBar,
  faHistory,
  faCog,
  faUser,
  faLock,
  faUnlock,
  faEraser,
  faFileExcel, 
  faFilePdf,
  faDownload ,
  faShieldAlt,
  faUpload,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons"

library.add(
  faHome,
  faBox,
  faTags,
  faUsers,
  faSignOutAlt,
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faEye,
  faSave,
  faTimes,
  faCheck,
  faExclamationTriangle,
  faChartBar,
  faHistory,
  faCog,
  faUser,
  faLock,
  faUnlock,
  faEraser,
  faFileExcel, 
  faFilePdf ,
  faDownload,
  faShieldAlt,
  faUpload,
  faInfoCircle 
)

import App from "./App.vue"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast, {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
})

app.component("font-awesome-icon", FontAwesomeIcon)

app.mount("#app")
