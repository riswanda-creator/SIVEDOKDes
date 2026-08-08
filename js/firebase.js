// =====================================================
// SUPABASE CLIENT
// SIVEDOKDes
// =====================================================

import {
    createClient
} from "https://esm.sh/@supabase/supabase-js@2";


// =====================================================
// SUPABASE CONFIG
// =====================================================

const SUPABASE_URL =
    "https://ittfhjzkejhsbowwqlrq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_javi5F477-dw8o3LD4YjHg_QejbW_cz";


// =====================================================
// INITIALIZE SUPABASE
// =====================================================

const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =====================================================
// EXPORT
// =====================================================

export {
    supabase
};
